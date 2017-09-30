var NodeManager = function(){
	this._nodes = [];
}

NodeManager.prototype.createDataNode = function(r, xmin, ymin, width, height){

	var node = new DataNode(r, xmin, ymin, width, height);
	node.showText();

	this._nodes.push(node);
	return node;
}

NodeManager.prototype.createFuncNode = function(type, r, xmin, ymin, width, height, round){

	var node = null;
	switch(type){
		case FUNCTION_TYPE.Stretch:{
			node = new Stretch(r, xmin, ymin, width, height, round);
		}
		break;
		case FUNCTION_TYPE.Fusion:{
			node = new Fusion(r, xmin, ymin, width, height, round);
		}
		break;
		case FUNCTION_TYPE.EdgeExtraction:{
			node = new EdgeExtraction(r, xmin, ymin, width, height, round);
		}
		break;
		case FUNCTION_TYPE.MeanImageFilter:{
			node = new MeanImageFilter(r, xmin, ymin, width, height, round);	
		}
		break;
		case FUNCTION_TYPE.MedianImageFilter:{
			node = new MedianImageFilter(r, xmin, ymin, width, height, round);		
		}
		break;
		case FUNCTION_TYPE.Smoothing:{
			node = new Smoothing(r, xmin, ymin, width, height, round);			
		}
		break;
		case FUNCTION_TYPE.Threshold:{
			node = new Threshold(r, xmin, ymin, width, height, round);
		}
		break;
		case FUNCTION_TYPE.Rescale:{
			node = new Rescale(r, xmin, ymin, width, height, round); 
		}
		break;
		case FUNCTION_TYPE.Cast:{
			node = new Cast(r, xmin, ymin, width, height, round); 
		}
		break;
		case FUNCTION_TYPE.BinaryThreshold:{
			node = new BinaryThreshold(r, xmin, ymin, width, height, round);
		}
		break;
		case FUNCTION_TYPE.IndexedToRGB:{
			node = new IndexedToRGB(r, xmin, ymin, width, height, round);	
		}
		break;
		case FUNCTION_TYPE.DiscreteGaussian:{
			node = new DiscreteGaussian(r, xmin, ymin, width, height, round);	
		}
		break;
		case FUNCTION_TYPE.Gradient:{
			node = new Gradient(r, xmin, ymin, width, height, round);	
		}
		break;
		case FUNCTION_TYPE.GradientGaussian:{
			node = new GradientGaussian(r, xmin, ymin, width, height, round);	
		}
		break;
		case FUNCTION_TYPE.Laplacian:{
			node = new Laplacian(r, xmin, ymin, width, height, round);		
		}
		break;
		case FUNCTION_TYPE.CannyEdgeDetection:{
			node = new CannyEdgeDetection(r, xmin, ymin, width, height, round);
		}
		break;
		case FUNCTION_TYPE.Erode:{
			node = new Erode(r, xmin, ymin, width, height, round);
		}
		break;
		case FUNCTION_TYPE.Dilate:{
			node = new Dilate(r, xmin, ymin, width, height, round);	
		}
		break;
		case FUNCTION_TYPE.Texture:{
			node = new Texture(r, xmin, ymin, width, height, round);		
		}
		break;
		case FUNCTION_TYPE.PanTex:{
			node = new PanTex(r, xmin, ymin, width, height, round);	
		}
		break;
		case FUNCTION_TYPE.HarrisDetector:{
			node = new HarrisDetector(r, xmin, ymin, width, height, round);		
		}
		break;
		case FUNCTION_TYPE.SURFDetector:{
			node = new SURFDetector(r, xmin, ymin, width, height, round);			
		}
		break;
		case FUNCTION_TYPE.LocalHoughExtrator:{
			node = new LocalHoughExtrator(r, xmin, ymin, width, height, round);				
		}
		break;
		case FUNCTION_TYPE.CloudDetection:{
			node = new CloudDetection(r, xmin, ymin, width, height, round);				
		}
		break;
		case FUNCTION_TYPE.OtsuSegment:{
			node = new OtsuSegment(r, xmin, ymin, width, height, round);				
		}
		break;
		case FUNCTION_TYPE.MeanDiffDetection:{
			node = new MeanDiffDetection(r, xmin, ymin, width, height, round);					
		}
		break;
		case FUNCTION_TYPE.MeanRadioDiffDetection:{
			node = new MeanRadioDiffDetection(r, xmin, ymin, width, height, round);					
		}	
		break;
		case FUNCTION_TYPE.KLDiffDetection:{
			node = new KLDiffDetection(r, xmin, ymin, width, height, round);					
		}
		break;
		case FUNCTION_TYPE.CorrelationDiffDetection:{
			node = new CorrelationDiffDetection(r, xmin, ymin, width, height, round);
		}
		break;
		case FUNCTION_TYPE.MultivariateDiffDetection:{
			node = new MultivariateDiffDetection(r, xmin, ymin, width, height, round);
		}
		break;
		case FUNCTION_TYPE.ROIExtract:{
			node = new ROIExtract(r, xmin, ymin, width, height, round);
		}
		break;
		default:
		break;
	}
	if(node){
		node.showText();
		this._nodes.push(node);
	}
	
	return node;
}


NodeManager.prototype.createStretchNode = function(r, xmin, ymin, width, height, round){

	var node = new FStretch(r, xmin, ymin, width, height, round);
	node.showText();
	this._nodes.push(node);
	return node;
}


NodeManager.prototype.getNodeById = function(id){
	var len = this._nodes.length;
	for(var i=0; i<len; i++){
		var wid = this._nodes[i].getID();

		if(this._nodes[i].getID() == id){
			return this._nodes[i];
		}
	}

	return null;
}

NodeManager.prototype.getDataNodes = function(){
	var nodes = [];
	this._nodes.forEach(function(n){
		if(n.getType() == NODE_TYPE.DATA){
			nodes.push(n);
		}
	})

	return nodes;
}


NodeManager.prototype.getFuncNodes = function(){
	var nodes = [];
	this._nodes.forEach(function(n){
		if(n.getType() == NODE_TYPE.FUNC){
			nodes.push(n);
		}
	})

	return nodes;
}

NodeManager.prototype.getFuncNode = function(){
	var count = this._nodes.length;
	for(var i=0; i<count; i++){
		if(this._nodes[i].getType() == NODE_TYPE.FUNC){
			return this._nodes[i];
		}
	}

	return null;
}

NodeManager.prototype.getNodes = function(){
	return this._nodes;
}

NodeManager.prototype.clear = function(){
	this._nodes.forEach(function(n){
		n.remove();
	});
	this._nodes.length = 0;
}

NodeManager.prototype.removeNodeByID = function(id){
	var len = this._nodes.length;
	for(var i=0; i<len; i++){
		var wid = this._nodes[i].getID();

		if(this._nodes[i].getID() == id){
			this._nodes[i].remove();
			this._nodes.splice(i,1);
			return;
		}
	}
}
