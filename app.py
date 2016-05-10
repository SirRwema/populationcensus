from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps

app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'ugcensus'
COLLECTION_NAME = 'perdistrict'
FIELDS = {'region':True,'district':True,'male':True,'females':True,'rural':True,'urban':True,'household':True,'nonhousehold':True,'total':True,'_id':False}


@app.route("/")
def index():
	return render_template("index.html")

@app.route("/censusdata/perdistrict")
def census_per_district():
	connection = MongoClient(MONGODB_HOST,MONGODB_PORT)
	collection = connection[DBS_NAME][COLLECTION_NAME]
	districts = collection.find(projection=FIELDS)
	json_census = []
	for d in districts:
		json_census.append(d)

	json_census = json.dumps(json_census,default = json_util.default)
	connection.close()
	return json_census

if __name__ =="__main__":
	app.run(host='0.0.0.0', port = 5000, debug = True)