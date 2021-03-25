#  imports
import json
import boto3
import io
from io import StringIO
from urllib.parse import urlparse
import numpy as np
import pandas as pd

#  called by main handler if model predictions suggest a disaster is occuring
def prediction_processor(predictions_df):
    
    # remove rows where prediction = 0 (they aren't disaster related)
    print('prediction_processor called!')
    predictions_df.columns = ['location','model_prediction']
    val_yes_disater_reduced = predictions_df.query("model_prediction > 0")
    print(val_yes_disater_reduced.sample(5))
    
    # create 2 seperate arrays: one with the locations to pass and the other with the amount of tweets per city
    ResultsLocationArray = np.array([])
    ResultsLocationRatiosArray = np.array([])
    ResultsArray = np.array([])
    ResultsLocationArray = np.append(val_yes_disater_reduced.location.unique(), ResultsLocationArray)
    ResultsLocationRatiosArray = np.append(val_yes_disater_reduced['location'].value_counts(), ResultsLocationRatiosArray)
    
    #  prints Locations & Ratios fort testing
    for result in ResultsLocationArray:
        print(result)
    for result in ResultsLocationRatiosArray:
        print(result)
        
    #  combine these 2 arrays into 1 2D array
    i = 0
    while i < ResultsLocationArray.size:
        ResultsArray = np.append([ResultsLocationArray[i],ResultsLocationRatiosArray[i]], ResultsArray)
        i +=1
    
    #  serialising the the results array into JSON format
    serializableList = ResultsArray.tolist()
    JsonStringPositive = json.dumps(serializableList) 
    
    #  print json string for testing purposes
    print(JsonStringPositive)
    #  return the json string so it can be returned via the API
    return JsonStringPositive

# main method called by API gateway
def lambda_handler(event, context):
    
    #  bucket to access predictions output by model 
    predictionsBucket = 'disaster-detection-predictions'
    predictionsKey = 'predictions.csv'
    client = boto3.client('s3')
    csv_obj = client.get_object(Bucket=predictionsBucket, Key=predictionsKey)
    body = csv_obj['Body']
    csv_string = body.read().decode('utf-8')

    predictions_df = pd.read_csv(StringIO(csv_string))
    predictions_df.shape
    
    #  print predictions datafrmae for testing purposes
    print(predictions_df.sample(5))
      
    # reducing the data to only the rows with a positive prediction
    predictionsArray = np.array([])
    
    for index, row in predictions_df.iterrows():
            result=[row['0']]
            predictionsArray = np.append(predictionsArray, result)
    
    disasterRelatedTweets = 0
    for prediction in predictionsArray:
        if (prediction == 1):
            disasterRelatedTweets += 1;
    
    # if more than 5000 tweets are predicted postiviely this will trigger the disaster true logic
    if(disasterRelatedTweets >=5000):
        JsonString = prediction_processor(predictions_df)
    # otherwise a 0 is returned 
    else:
        # print statement for testing purposes
        print('no disaster today!')
        JsonString = json.dumps('0')
        
    # the response sent via API gateway
    return {
        'statusCode': 200,
        'body': JsonString
    }