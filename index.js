/*=============================================
=            Import of npm modules            =
=============================================*/
const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
/*=====  End of Import of npm modules  ======*/




/*=================================================================
=            Function to connect to the mongodb server            =
=================================================================*/

module.exports.connect = (url)=>{
	mongoose.connect(url, (error, doc)=>{
		if(error){
			console.log("Error found while connecting to the mongodb server.");
		}else{
			console.log("Successfully connected to the mongodb server.");
		}
	});
	
}


/*=====  End of Function to connect to the mongodb server  ======*/


/*==================================================
=            Initialize Validation Save            =
==================================================*/
const initValidationSave = module.exports.initValidationSave = (requestBody, model)=>{
	if(requestBody.password) requestBody.password = bcrypt.hashSync(requestBody.password);
	let newDocument = new model(requestBody);
	let error = newDocument.validateSync();
	if(error){
		return {
			"errorFound" : true,
			"errors" : validationSyncError(error)
		};
	}else{
		return {
			"errorFound" : false,
			"newDocument" : newDocument
		}
	}
};


/*=====  End of Initialize Validation Save  ======*/



/*=============================================
=            Validation Sync Error            =
=============================================*/
const validationSyncError = module.exports.validationSyncError = (error)=>{
	let errorList = new Array();
	for(let a in error.errors){
		errorList.push({
			"path" : error.errors[a]["path"],
			"kind" : error.errors[a]["kind"],
			"message" : error.errors[a]["path"]+" is " + error.errors[a]["kind"]
		});
	}

	return errorList;
};


/*=====  End of Validation Sync Error  ======*/


/*===============================================
=            Initialize Search Query            =
===============================================*/
const initSearchQuery = module.exports.initSearchQuery =  (requestQuery)=>{
	requestQuery.search = requestQuery.search? new RegExp(requestQuery.search,"gmi") : new RegExp("","gmi");
	requestQuery.from =  (requestQuery.from && !isNaN(requestQuery.from))? parseInt(requestQuery.from): 0;
	requestQuery.limit = (requestQuery.limit && !isNaN(requestQuery.limit))? parseInt(requestQuery.limit) : 10;
	requestQuery.fields = initQueryFields(requestQuery.fields);
	requestQuery.searchFields = initGlobalSearch(requestQuery.searchFields, requestQuery.search);
	return requestQuery;
};


/*=====  End of Initialize Search Query  ======*/


/*====================================
=            Query Fields            =
====================================*/
const initQueryFields = module.exports.initQueryFields = (fields)=>{
	let queryFields = new Object();
	if(fields){
		fields = fields.split(",").map((elem)=> elem.trim()).filter((elem)=> elem!="password").forEach((elem)=>queryFields[elem]=true);
	}else{
		queryFields["_id"] = true;
	}
	return queryFields
};


/*=====  End of Query Fields  ======*/




/*===========================================
=            Global Search Query            =
===========================================*/
const initGlobalSearch = module.exports.initGlobalSearch = (fields, searchRegExp)=>{
	let globalSearchObject = new Object();
	if(fields){
		globalSearchObject["$or"] = new Array();
		fields = fields.split(",").map((elem)=> elem.trim()).filter((elem)=> elem!="_id"&&elem!="password").forEach((elem)=>{
			let searchObject = new Object();
			searchObject[elem] = searchRegExp;
			globalSearchObject["$or"].push(searchObject);
		});
	}

	return globalSearchObject;
};

/*=====  End of Global Search Query  ======*/
