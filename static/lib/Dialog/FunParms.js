
var g_fun_parms = [
	{
		"funName" 	: "EdgeExtraction",
		"parms"		:[
			{
				"name" : "pixel",
				"values":[
					{ "name":"uint8","value":"uint8"},
					{ "name":"uint16","value":"uint16"},
					{ "name":"int16","value":"int16"},
					{ "name":"uint32","value":"uint32"},
					{ "name":"int32","value":"int32"},
					{ "name":"float","value":"float"},
					{ "name":"double","value":"double"}
				]
			},{
				"name" : "filter",
				"values":[
					{ "name":"gradient滤波","value":"gradient"},
					{ "name":"sobel滤波","value":"sobel"},
					{ "name":"gaussian滤波","value":"touzi"},
				]
			}
		]
	},{
		"funName" 	: "Smoothing",
		"parms"		:[
			{
				"name" : "pixel",
				"values":[
					{ "name":"uint8","value":"uint8"},
					{ "name":"uint16","value":"uint16"},
					{ "name":"int16","value":"int16"},
					{ "name":"uint32","value":"uint32"},
					{ "name":"int32","value":"int32"},
					{ "name":"float","value":"float"},
					{ "name":"double","value":"double"}
				]
			},{
				"name" : "type",
				"values":[
					{ "name":"anidif滤波","value":"anidif"},
					{ "name":"均值滤波","value":"mean"},
					{ "name":"高斯滤波","value":"gaussian"},
				]
			}
		]
	},{
		"funName" 	: "Fusion",
		"parms"		:[
			{
				"name" : "pixel",
				"values":[
					{ "name":"uint8","value":"uint8"},
					{ "name":"uint16","value":"uint16"},
					{ "name":"int16","value":"int16"},
					{ "name":"uint32","value":"uint32"},
					{ "name":"int32","value":"int32"},
					{ "name":"float","value":"float"},
					{ "name":"double","value":"double"}
				]
			},{
				"name" : "method",
				"values":[
					{ "name":"rcs融合","value":"rcs"},
					{ "name":"lmvm融合","value":"lmvm"},
					{ "name":"贝叶斯融合","value":"bayes"},
				]
			}
		]
	}
];


function getFunParm(funName,parm){
	if(!funName || !parm){
		return [];
	}
	for(var i = 0; i < g_fun_parms.length;++i){
		var g_funName = g_fun_parms[i].funName;
		if(g_funName === funName){
			var g_parms = g_fun_parms[i].parms;
			for(var j = 0; j < g_parms.length; ++j){
				if(g_parms[j].name == parm){
					return g_parms[j].values;
				}
			}
		}
	}

	return [];
}


