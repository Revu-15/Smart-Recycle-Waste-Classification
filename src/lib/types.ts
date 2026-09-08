export type WasteCategory = {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  recyclingMethod: string;
  materialInfo: string;
};

export type Alternative = {
  label: string;
  confidence: number;
};

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PredictionObject = {
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
  material: string;
  recyclable: boolean;
  contamination: "Low" | "Medium" | "High";
  recommendation: string;
  explanation: string[];
};

export type PredictionDetection = {
  type: string;
  label?: string;
  material: string;
  confidence: number;
  recyclable: boolean;
  contamination: "Low" | "Medium" | "High";
  cleaning: string;
  recommendation: string;
  explanation: string[];
  alternatives: Alternative[];
  boundingBox?: BoundingBox;
};

export type PredictionResponse = {
  id: string;
  prediction: string;
  confidence: number;
  material: string;
  recyclable: boolean;
  contamination: "Low" | "Medium" | "High";
  cleaning: string;
  recommendation: string;
  explanation: string[];
  alternatives: Alternative[];
  status: "completed";
  detections?: PredictionDetection[];
  objects?: PredictionObject[];
};

export type FeedbackRecord = {
  id: string;
  image: string;
  predictedLabel: string;
  correctLabel: string;
  confidence: number;
  timestamp: string;
  userFeedback: "correct" | "incorrect";
  status: "stored";
};

export type FeedbackSubmissionPayload = Omit<FeedbackRecord, "id" | "timestamp" | "status"> & {
  correctedLabel?: string;
  feedbackType?: "correct" | "incorrect";
  timestamp?: string;
  image: string;
};

export type FeedbackStats = {
  totalPredictions: number;
  averageConfidence: number;
  recyclableItems: number;
  nonRecyclableItems: number;
  feedbackAccuracy: number;
  mostCommonWaste: string;
  wasteDistribution: Array<{ name: string; value: number }>;
  contaminationLevels: Array<{ name: string; value: number }>;
  feedbackTrends: Array<{ date: string; correct: number; incorrect: number }>;
  predictionAccuracy: number;
};
