import numpy as np
import json

def handler(event, context):
    arr = np.random.randint(0, 10, (3, 3))
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Hello from Lambda!", "array": arr.tolist()}),
    }