import argparse
import pandas as pd
import numpy as np
import os
import json
from io import StringIO

import joblib 

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression

from sklearn.pipeline import Pipeline

from sagemaker_containers.beta.framework import (worker, encoders)

# method to train and save the model
def training():
    
    print("TRAINING FUNCTION START")
    # Take the set of files and read them all into a single pandas dataframe
    input_files = [ os.path.join(args.train, file) for file in os.listdir(args.train) ]
    
    if len(input_files) == 0:
        raise ValueError(('There are no files in {}.\n' +
                          'This usually indicates that the channel ({}) was incorrectly specified,\n' +
                          'the data specification in S3 was incorrectly specified or the role specified\n' +
                          'does not have permission to access the data.').format(args.train, "train"))

    raw_data = [ pd.read_csv(file, engine="python") for file in input_files ]
    train_data = pd.concat(raw_data)
    
    # labels are in the first column
    train_y = train_data['label']
    print(str(train_y.sample(5)))
    train_X = train_data['data']
    print(str(train_X.sample(5)))
    
    pipeline = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', LogisticRegression()),
    ])

    pipeline.fit(train_X.values.astype('U').tolist(), train_y.tolist())

    # Print the coefficients of the trained classifier, and save the coefficients
    joblib.dump(pipeline, os.path.join(args.model_dir, "model.joblib"))

if __name__ == '__main__':
    
    print("MAIN FUNCTION START")
    parser = argparse.ArgumentParser()
    
    # Sagemaker specific arguments. Defaults are set in the environment variables.
    parser.add_argument('--output-data-dir', type=str, default=os.environ['SM_OUTPUT_DATA_DIR'])
    parser.add_argument('--model-dir', type=str, default=os.environ['SM_MODEL_DIR'])
    parser.add_argument('--train', type=str, default=os.environ['SM_CHANNEL_TRAIN'])

    args = parser.parse_args()
    training()

# [REQUIRED]: method to load model
def model_fn(model_dir):
    
    print("MODEL FUNCTION START")
    """Deserialized and return fitted model

    Note that this should have the same name as the serialized model in the main method
    """
    clf = joblib.load(os.path.join(model_dir, "model.joblib"))
    
    return clf

# [REQUIRED]: method to handle input of requests....
def input_fn(request_body, request_content_type):
    
    print("INPUT FUNCTION START") 
    print(str(request_content_type))
    """An input_fn that loads a pickled numpy array"""
    
    if request_content_type == 'text/csv':
        # Read the raw input data as CSV.
        print('CSV FILE INPUT RECEIVED')
        df = pd.read_csv(StringIO(request_body), dtype={"data": "string"})
        print(str(df.head(3)))
        print(df.dtypes)
        print(df.shape)       
        return df
    elif request_content_type == "application/python-pickle":
        array = np.load(BytesIO((request_body)))
        return array
    elif request_content_type == 'application/json':
        jsondata = json.load(StringIO(request_body))
        #processed_data = process_data(jsondata)
        return [jsondata['instances'][0]['features'][0]]
    else:
        # Handle other content-types here or raise an Exception
        # if the content type is not supported.
        raise ValueError("{} not supported by script!".format(request_content_type))

# [REQUIRED]: method to run prediction on the model
def predict_fn(input_data, model):
    
    print("PREDICT FUNCTION START")
    print(str(input_data.head(3)))
    print(type(input_data))
    print(input_data.dtypes)
    print(input_data.shape) 
    predictions = []
    
    for index, row in input_data.iterrows():
        message=[row['data']]
#       print(type(message)) statement returns <class 'list'>
        prediction = model.predict(message)
        predictions.append(prediction[0])
        
    print(predictions[:10])
    nrow = len(predictions)
    print('Predictions list number of rows:')
    print(str(nrow))
    print(type(predictions)) # statement returns <class 'list'>
    predictions.insert(0, 0)
    
    return predictions 

# [REQUIRED]: method to handle output of requests....
def output_fn(prediction, accept):
    
    print("OUTPUT FUNCTION START")
    print(prediction[:10])
    print(type(prediction)) 
    nrow = len(prediction)
    print('Prediction list number of rows:')
    print(str(nrow))
    
    if accept == "application/json":
        return worker.Response(json.dumps(prediction), accept, mimetype=accept)
    elif accept == 'text/csv':
        output = worker.Response(encoders.encode(prediction, accept), accept, mimetype=accept)
        print(type(output))
        print(str(output))
        return output
    else:
        raise ValueError("{} accept type is not supported by this script.".format(accept)) 
