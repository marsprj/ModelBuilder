
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
 				name : "道路提取",
 				items : [
 					{
 						name : "道路提取",
 						type : ""
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
		name : "图像分割",
		items:[
			{
				name : "区域生长",
				items:[
					{
						name : "连通域分割",
						type : ""
					},{
						name : "Otsu自动阈值分割",
						type : "OtsuSegment"
					}
				]
			},{
				name : "基于分水岭的分割",
				type : ""
			},{
				name : "水平集的图像分割",
				type : ""
			}
		]
	},{
		name : "分类",
		items:[
			{
				name : "非监督分类",
				items : [
					{
						name : "K-Means分类",
						type : "KMeans"
					},{
						name : "基于Kd树的KMeans聚类",
						type : ""
					},{
						name : "SOM分类",
						type : ""
					},{
						name : "贝叶斯分类",
						type : ""
					},{
						name : "最大期望混合模型估计",
						type : ""
					},{
						name : "统计分割",
						type : ""
					},{
						name : "马尔科夫随机场分类",
						type : ""
					}
				]
			},{
				name : "监督分类",
				type : ""
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
	},{
		name : "高光谱",
		items :[
			{
				name : "Unmixing",
				type : ""
			},{
				name : "降维",
				type : ""
			},{
				name : "异常检测",
				type : ""
			}
		]
	},{
		name : "变化检测",
		items : [
			{
				name : "简单变化检测",
				items : [
					{
						name : "平均变化检测",
						type : "MeanDiffDetection"
					},{
						name : "平均比率变化检测",
						type : "MeanRadioDiffDetection"
					}
				]
			},{
				name : "统计变化检测",
				items : [
					{
						name : "基于Kullback-Leibler距离检测",
						type : "KLDiffDetection"
					},{
						name : "基于相关系数的变化检测",
						type : "CorrelationDiffDetection"
					}
				]
			},{
				name : "多尺度变化检测",
				type : ""
			},{
				name : "多成分变化检测",
				type : "MultivariateDiffDetection"
			}
		]
	},{
		name : "图像IO",
		items : [
			{
				name : "影像裁剪",
				items : [
					{
						name : "ROI裁剪",
						type : "ROIExtract"
					}
				]
			}
		]
	}
];