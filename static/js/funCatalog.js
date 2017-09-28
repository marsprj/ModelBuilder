
var g_funCatalog = [
	{
		name : "灰度变换",
		items : [
			{
				name : "灰度拉伸",
				type : "Rescale"
			},{
				name : "灰度Cast",
				type : "Cast"
			},{
				name : "灰度分割",
				type : "Threshold"
			},{
				name : "灰度二值化",
				type : "BinaryThreshold"
			},{
				name : "栅格转RGB图像",
				type : "IndexedToRGB"
			}
		]
	},{
		name : "空域滤波",
		items : [
			{
				name : "平滑滤波（低通滤波）",
				items : [
					{
						name : "均值滤波",
						type : "MeanImageFilter",	
					},{
						name : "中值滤波",
						type : "MeanImageFilter",	
					},{
						name : "高斯平滑",
						type : "DiscreteGaussian",	
					}
				]
			},{
				name : "锐化滤波（高通滤波）",
				items:[
					{
						name : "梯度计算（一阶微分）",
						type : "Gradient"
					},{
						name : "带平滑的梯度计算（一阶微分）",
						type : "GradientGaussian"
					},{
						name : "拉普拉斯滤波（二阶微分）",
						type : "Laplacian"
					}
				]
			},{
				name : "边缘检测",
				items:[
					{
						name : "Canny边缘检测",
						type : "CannyEdgeDetection"
					},{
						name : "Touzi边缘检测",
						type : "TouziEdgeDetection"
					}
				]
			},{
				name : "数学形态学",
				items:[
					{
						name : "腐蚀Erode",
						type : "Erode"
					},{
						name : "膨胀Dilate",
						type : "Dilate"
					}
				]
			}
		]
	},{
		name : "频域滤波",
		items : [
		]
	},{
		name : "图像融合",
		items :[
			{
				name : "图像融合",
				type : "Fusion"
			}
		]
	},{
		name : "特征提取",
		items : [
			{
				name : "纹理提取",
				items : [
					{
						name : "灰度共生矩阵(Haralick)",
						type : "Texture"
					},{
						name : "PanTex纹理",
						type : "PanTex"
					}
				]
			},{
				name : "特征点提取",
				items :[
					{
						name : "Harris特征点检测",
						type : "HarrisDetector"
					},{
						name : "SURF特征点检测",
						type : "SURFDetector"
					}
				]
 			},{
 				name : "Alignment",
 				type : "Alignment"
 			},{
 				name : "线提取（SAR）",
 				items : [
 					{
 						name : "Radio线检测",
 						type : "RadioLineDetector"
 					},{
 						name : "Coorelation线检测",
 						type : ""
 					},{
 						name : "Hough线提取",
 						type : "LocalHoughExtrator"
 					}
 				]
 			},{
 				name : "云检测",
 				items:[
 					{
 						name : "云检测",
 						type : "CloudDetection"
 					}
 				]
 			}
		]
	},{
		name : "SAR",
		items: [
			{
				name : "滤波",
				items : [
					{
						name : "Froest滤波",
						type : ""
					},{
						name : "Lee滤波",
						type : ""
					}
				]
			}
		]
	}
];