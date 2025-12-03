import { Category, PromptState } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'camera',
    title: 'Camera Motions',
    icon: 'Camera',
    description: 'Define how the camera moves',
    allowMultiple: true,
    options: [
      { id: 'zoom_in', label: 'Zoom In', value: 'camera zoom in' },
      { id: 'zoom_out', label: 'Zoom Out', value: 'camera zoom out' },
      { id: 'pan_left', label: 'Pan Left', value: 'camera pan left' },
      { id: 'pan_right', label: 'Pan Right', value: 'camera pan right' },
      { id: 'static', label: 'Static', value: 'static camera' },
      { id: 'handheld', label: 'Handheld', value: 'handheld camera movement' },
    ]
  },
  {
    id: 'subject',
    title: 'Subject Actions',
    icon: 'Activity',
    description: 'What is the main subject doing?',
    allowMultiple: true,
    options: [
      { id: 'walking', label: 'Walking', value: 'subject walking forward' },
      { id: 'running', label: 'Running', value: 'subject running fast' },
      { id: 'dancing', label: 'Dancing', value: 'dancing rhythmically' },
      { id: 'talking', label: 'Talking', value: 'talking expressively' },
      { id: 'eating', label: 'Eating', value: 'eating' },
      { id: 'sleeping', label: 'Sleeping', value: 'sleeping peacefully' },
    ]
  },
  {
    id: 'style',
    title: 'Art Styles',
    icon: 'Sparkles',
    description: 'Visual style of the video',
    allowMultiple: false,
    options: [
      { id: 'cinematic', label: 'Cinematic', value: 'cinematic lighting, movie style' },
      { id: 'anime', label: 'Anime', value: 'anime style, studio ghibli' },
      { id: 'photorealistic', label: 'Photorealistic', value: '8k photorealistic, unreal engine 5' },
      { id: 'oil_painting', label: 'Oil Painting', value: 'oil painting style, textured' },
      { id: 'cyberpunk', label: 'Cyberpunk', value: 'cyberpunk 2077 style, neon lights' },
    ]
  },
  {
    id: 'lighting',
    title: 'Lighting',
    icon: 'Lightbulb',
    description: 'Atmosphere and lighting conditions',
    allowMultiple: true,
    options: [
      { id: 'golden_hour', label: 'Golden Hour', value: 'golden hour lighting' },
      { id: 'blue_hour', label: 'Blue Hour', value: 'blue hour, cold tones' },
      { id: 'studio', label: 'Studio', value: 'professional studio lighting' },
      { id: 'natural', label: 'Natural', value: 'soft natural light' },
      { id: 'neon', label: 'Neon', value: 'bright neon lighting' },
    ]
  },
  {
    id: 'environment',
    title: 'Environment',
    icon: 'MapPin',
    description: 'Where does the scene take place?',
    allowMultiple: false,
    options: [
      { id: 'forest', label: 'Forest', value: 'in a dense forest' },
      { id: 'city', label: 'City Street', value: 'on a busy city street' },
      { id: 'space', label: 'Outer Space', value: 'in deep outer space' },
      { id: 'beach', label: 'Beach', value: 'on a sunny tropical beach' },
      { id: 'indoor', label: 'Indoor Room', value: 'inside a cozy room' },
    ]
  },
  {
    id: 'quality',
    title: 'Quality',
    icon: 'Settings',
    description: 'Technical quality parameters',
    allowMultiple: true,
    options: [
      { id: '4k', label: '4K', value: '4k resolution' },
      { id: '8k', label: '8K', value: '8k resolution' },
      { id: 'high_detail', label: 'High Detail', value: 'highly detailed' },
      { id: 'masterpiece', label: 'Masterpiece', value: 'masterpiece' },
    ]
  }
];

export const INITIAL_PROMPT_STATE: PromptState = {
  camera: [],
  subject: [],
  style: [],
  lighting: [],
  environment: [],
  quality: [],
};