import type { AccessState, AttemptRecord, LearningModule, PaymentRecord, Question, Questionnaire } from './types'

export const modules: LearningModule[] = [
  {
    id: 'traffic-signs',
    order: 1,
    title: 'Traffic Signs',
    description: 'Learn about road signs, their meanings and importance.',
    color: 'blue',
    progress: 0,
    questionCount: 120,
    lessons: [
      { id: 'ts-1', title: 'Regulatory signs', duration: '12 min', type: 'video', completed: true, summary: 'Stop, yield, speed limit and one-way signs and what they legally require.' },
      { id: 'ts-2', title: 'Warning signs', duration: '10 min', type: 'video', completed: true, summary: 'Diamond-shaped signs that alert you to hazards ahead.' },
      { id: 'ts-3', title: 'Guide and information signs', duration: '8 min', type: 'reading', completed: true, summary: 'Route markers, service signs and destination guides.' },
      { id: 'ts-4', title: 'Road markings', duration: '15 min', type: 'reading', completed: false, summary: 'Pavement markings, lanes, and what line colors and patterns mean.' },
    ],
  },
  {
    id: 'road-rules',
    order: 2,
    title: 'Road Rules',
    description: 'Understand the rules of the road and safe driving regulations.',
    color: 'orange',
    progress: 0,
    questionCount: 150,
    lessons: [
      { id: 'rr-1', title: 'Right of way', duration: '14 min', type: 'video', completed: true, summary: 'Who goes first at intersections, crossings and merges.' },
      { id: 'rr-2', title: 'Speed management', duration: '11 min', type: 'video', completed: true, summary: 'Speed limits, adjusting speed for conditions and basic speed law.' },
      { id: 'rr-3', title: 'Intersections and turns', duration: '13 min', type: 'reading', completed: false, summary: 'Turning lanes, U-turns and signaling requirements.' },
      { id: 'rr-4', title: 'Parking rules', duration: '9 min', type: 'reading', completed: false, summary: 'Legal parking distances, curbs and prohibited zones.' },
    ],
  },
  {
    id: 'defensive-driving',
    order: 3,
    title: 'Defensive Driving',
    description: 'Learn defensive driving techniques and stay safe on the road.',
    color: 'green',
    progress: 0,
    questionCount: 100,
    lessons: [
      { id: 'dd-1', title: 'Following distance', duration: '10 min', type: 'video', completed: true, summary: 'The three-second rule and adjusting for weather and traffic.' },
      { id: 'dd-2', title: 'Scanning and awareness', duration: '12 min', type: 'reading', completed: false, summary: 'Mirror checks, blind spots and predicting hazards.' },
      { id: 'dd-3', title: 'Handling emergencies', duration: '15 min', type: 'video', completed: false, summary: 'Skids, blowouts and brake failure response.' },
    ],
  },
  {
    id: 'vehicle-knowledge',
    order: 4,
    title: 'Vehicle Knowledge',
    description: 'Get to know your vehicle and its important components.',
    color: 'purple',
    progress: 0,
    questionCount: 80,
    lessons: [
      { id: 'vk-1', title: 'Controls and instruments', duration: '9 min', type: 'video', completed: true, summary: 'Pedals, steering, lights, wipers and dashboard warnings.' },
      { id: 'vk-2', title: 'Maintenance basics', duration: '12 min', type: 'reading', completed: false, summary: 'Tires, brakes, fluids and safe vehicle checks.' },
      { id: 'vk-3', title: 'Safety equipment', duration: '8 min', type: 'reading', completed: false, summary: 'Seat belts, airbags, mirrors and child restraints.' },
    ],
  },
]

export const questionBank: Question[] = [
  { id: 'q1', moduleId: 'traffic-signs', type: 'single', text: 'What should you do at a stop sign?', options: ['Slow down and continue if clear', 'Come to a complete stop, then proceed when safe', 'Stop only if other vehicles are present', 'Sound your horn and proceed'], correct: [1], difficulty: 'easy', explanation: 'A stop sign requires a full stop at the line, crosswalk or intersection before proceeding when safe.' },
  { id: 'q2', moduleId: 'traffic-signs', type: 'single', text: 'A diamond-shaped sign indicates:', options: ['A regulation', 'A warning about hazards ahead', 'A route marker', 'A service area'], correct: [1], difficulty: 'easy', explanation: 'Diamond-shaped signs warn of existing or possible hazards on the road or adjacent areas.' },
  { id: 'q3', moduleId: 'traffic-signs', type: 'truefalse', text: 'A yellow solid line next to your lane means passing is not allowed.', options: ['True', 'False'], correct: [0], difficulty: 'easy', explanation: 'A solid yellow line on your side of the center line means do not cross to pass.' },
  { id: 'q4', moduleId: 'traffic-signs', type: 'single', text: 'A flashing red traffic light means:', options: ['Proceed with caution', 'Stop, then go when clear', 'Stop and remain stopped', 'The signal is out of order'], correct: [1], difficulty: 'medium', explanation: 'A flashing red light is treated like a stop sign: stop, then proceed when safe.' },
  { id: 'q5', moduleId: 'traffic-signs', type: 'single', text: 'An eight-sided (octagonal) sign always means:', options: ['Yield', 'Stop', 'No parking', 'Railroad crossing'], correct: [1], difficulty: 'easy', explanation: 'The octagonal red sign with "STOP" is always a stop sign, even if the color fades.' },
  { id: 'q6', moduleId: 'traffic-signs', type: 'single', text: 'White lines painted across the road (transverse markings) generally:', options: ['Separate opposing traffic', 'Guide you through turns', 'Give orders at specific locations like stop lines and crosswalks', 'Show parking zones'], correct: [2], difficulty: 'medium', explanation: 'Transverse markings include stop lines, crosswalks and give-way lines at specific points.' },
  { id: 'q7', moduleId: 'traffic-signs', type: 'truefalse', text: 'A pentagon-shaped sign near the road indicates a school zone or school crossing.', options: ['True', 'False'], correct: [0], difficulty: 'easy', explanation: 'Pentagon-shaped signs warn of school zones and school crossings.' },
  { id: 'q8', moduleId: 'road-rules', type: 'single', text: 'At a four-way stop, two vehicles arrive at the same time. Who goes first?', options: ['The vehicle on the left', 'The vehicle on the right', 'The larger vehicle', 'The faster driver'], correct: [1], difficulty: 'easy', explanation: 'When two vehicles arrive simultaneously, the driver on the left yields to the driver on the right.' },
  { id: 'q9', moduleId: 'road-rules', type: 'single', text: 'You are turning left at an intersection with a green light. You must:', options: ['Turn immediately', 'Yield to oncoming traffic and pedestrians', 'Sound your horn', 'Move into the crosswalk and wait'], correct: [1], difficulty: 'easy', explanation: 'On a permitted green light, left-turning traffic must yield to oncoming vehicles and pedestrians.' },
  { id: 'q10', moduleId: 'road-rules', type: 'truefalse', text: 'You may cross a solid white line when merging only if it is safe to do so.', options: ['True', 'False'], correct: [0], difficulty: 'medium', explanation: 'Solid white lines discourage lane changes; crossing is allowed only when necessary and safe.' },
  { id: 'q11', moduleId: 'road-rules', type: 'single', text: 'Unless otherwise posted, the speed limit in a residential district is usually:', options: ['15 mph (25 km/h)', '25 mph (40 km/h)', '45 mph (70 km/h)', '65 mph (105 km/h)'], correct: [1], difficulty: 'medium', explanation: 'Residential districts typically carry a 25 mph (40 km/h) statutory limit when not posted.' },
  { id: 'q12', moduleId: 'road-rules', type: 'single', text: 'When may you make a U-turn?', options: ['Anywhere on a straight road', 'Where it is not prohibited and can be made safely', 'Only at traffic lights', 'On any freeway shoulder'], correct: [1], difficulty: 'medium', explanation: 'U-turns are legal where not prohibited by signs or markings and when safe and clear of traffic.' },
  { id: 'q13', moduleId: 'road-rules', type: 'truefalse', text: 'You must signal at least 100 feet (30 m) before turning.', options: ['True', 'False'], correct: [0], difficulty: 'easy', explanation: 'Signal continuously for at least 100 feet (30 m) before turning so others can anticipate your move.' },
  { id: 'q14', moduleId: 'road-rules', type: 'single', text: 'Parking is prohibited within how many feet of a fire hydrant?', options: ['5 feet', '10 feet', '15 feet', '30 feet'], correct: [2], difficulty: 'hard', explanation: 'Most jurisdictions prohibit parking within 15 feet of a fire hydrant.' },
  { id: 'q15', moduleId: 'defensive-driving', type: 'single', text: 'The recommended minimum following distance in good conditions is:', options: ['One second', 'Three seconds', 'Five car lengths', 'Ten seconds'], correct: [1], difficulty: 'easy', explanation: 'Keep at least a three-second gap; increase it in rain, fog or when following large vehicles.' },
  { id: 'q16', moduleId: 'defensive-driving', type: 'single', text: 'Your vehicle starts to hydroplane. You should:', options: ['Brake hard immediately', 'Accelerate to regain traction', 'Ease off the accelerator and steer straight', 'Turn sharply toward the shoulder'], correct: [2], difficulty: 'medium', explanation: 'Ease off the gas, avoid braking hard and steer steadily until the tires regain contact.' },
  { id: 'q17', moduleId: 'defensive-driving', type: 'truefalse', text: 'Checking your mirrors every 5–8 seconds helps maintain awareness of surrounding traffic.', options: ['True', 'False'], correct: [0], difficulty: 'easy', explanation: 'Regular mirror scans build a continuous picture of traffic around your vehicle.' },
  { id: 'q18', moduleId: 'defensive-driving', type: 'single', text: 'Before changing lanes, the correct sequence is:', options: ['Signal, check mirrors, check blind spot, move', 'Move, then signal', 'Check blind spot only', 'Signal and move immediately'], correct: [0], difficulty: 'easy', explanation: 'Signal first, check mirrors and the blind spot with a head check, then change lanes smoothly.' },
  { id: 'q19', moduleId: 'defensive-driving', type: 'single', text: 'If your brakes fail completely, your first action should be:', options: ['Pump the brake pedal and downshift', 'Jump out of the vehicle', 'Turn off the engine at full speed', 'Steer into oncoming traffic'], correct: [0], difficulty: 'hard', explanation: 'Pump the pedal to rebuild pressure, downshift to use engine braking, then use the parking brake gradually.' },
  { id: 'q20', moduleId: 'defensive-driving', type: 'truefalse', text: 'Tailgating a slow driver is an acceptable way to encourage them to speed up.', options: ['True', 'False'], correct: [1], difficulty: 'easy', explanation: 'Tailgating is aggressive and dangerous. Keep a safe distance and pass only when legal and safe.' },
  { id: 'q21', moduleId: 'vehicle-knowledge', type: 'single', text: 'A red dashboard warning light usually indicates:', options: ['A service reminder', 'A serious fault needing immediate attention', 'A low fuel level only', 'Normal operation'], correct: [1], difficulty: 'easy', explanation: 'Red lights indicate serious faults (e.g., oil pressure, brake system, battery) that need immediate action.' },
  { id: 'q22', moduleId: 'vehicle-knowledge', type: 'single', text: 'Properly inflated tires help with:', options: ['Fuel economy, handling and tire life', 'A softer ride only', 'Nothing significant', 'Louder road noise'], correct: [0], difficulty: 'easy', explanation: 'Correct tire pressure improves safety, fuel economy, handling and tread life.' },
  { id: 'q23', moduleId: 'vehicle-knowledge', type: 'truefalse', text: 'Anti-lock brakes (ABS) allow you to steer while braking hard.', options: ['True', 'False'], correct: [0], difficulty: 'medium', explanation: 'ABS prevents wheel lock, so you can steer around hazards while applying firm brake pressure.' },
  { id: 'q24', moduleId: 'vehicle-knowledge', type: 'single', text: 'Seat belts must be worn:', options: ['Only on highways', 'Only by the driver', 'By the driver and all passengers', 'Only in front seats'], correct: [2], difficulty: 'easy', explanation: 'The driver is responsible for ensuring everyone in the vehicle is properly restrained.' },
  { id: 'q25', moduleId: 'vehicle-knowledge', type: 'single', text: 'Worn brake pads are often detected by:', options: ['A squealing or grinding noise when braking', 'Brighter headlights', 'A smoother ride', 'Faster acceleration'], correct: [0], difficulty: 'medium', explanation: 'Squealers and grinding sounds indicate pad wear; have brakes inspected promptly.' },
  { id: 'q26', moduleId: 'vehicle-knowledge', type: 'truefalse', text: 'Headlights should be used between sunset and sunrise and in poor visibility.', options: ['True', 'False'], correct: [0], difficulty: 'easy', explanation: 'Use headlights from sunset to sunrise and whenever visibility is reduced (fog, rain, snow).' },
  { id: 'q27', moduleId: 'road-rules', type: 'single', text: 'When an emergency vehicle with sirens approaches, you should:', options: ['Speed up to clear the way', 'Stop immediately where you are', 'Pull over to the right and stop until it passes', 'Follow closely to get through traffic'], correct: [2], difficulty: 'easy', explanation: 'Pull over to the right edge, stop, and remain there until the emergency vehicle has passed.' },
  { id: 'q28', moduleId: 'traffic-signs', type: 'single', text: 'A yield sign means:', options: ['Always stop', 'Slow down and give the right of way when needed', 'Speed up to merge', 'Road ends ahead'], correct: [1], difficulty: 'easy', explanation: 'Yield: slow down, give the right of way to traffic and pedestrians, and stop if necessary.' },
]

export const questionnaires: Questionnaire[] = [
  { id: 'traffic-signs', moduleId: 'traffic-signs', title: 'Traffic Signs', description: 'Signs, signals and road markings.', questionCount: 120, passMark: 70, mode: 'practice' },
  { id: 'road-rules', moduleId: 'road-rules', title: 'Road Rules', description: 'Right of way, speed and regulations.', questionCount: 150, passMark: 70, mode: 'practice' },
  { id: 'defensive-driving', moduleId: 'defensive-driving', title: 'Defensive Driving', description: 'Hazard awareness and safe techniques.', questionCount: 100, passMark: 70, mode: 'practice' },
  { id: 'vehicle-knowledge', moduleId: 'vehicle-knowledge', title: 'Vehicle Knowledge', description: 'Vehicle components and safety equipment.', questionCount: 80, passMark: 70, mode: 'practice' },
]

export const mockTests: Questionnaire[] = [
  { id: 'mock-a', moduleId: 'random', title: 'Mock Test A', description: 'Full-length simulation of the official exam.', questionCount: 20, passMark: 70, mode: 'mock' },
  { id: 'mock-b', moduleId: 'random', title: 'Mock Test B', description: 'Mixed-topic exam simulation.', questionCount: 15, passMark: 70, mode: 'mock' },
  { id: 'mock-c', moduleId: 'random', title: 'Quick Mock Test C', description: 'Short exam simulation for a fast check-in.', questionCount: 10, passMark: 70, mode: 'mock' },
]

export const paymentHistory: PaymentRecord[] = [
  { id: 'pay-1042', userName: 'John Doe', userEmail: 'john@example.com', plan: 'Premium Access', amount: 2500, reference: 'DP-88371', status: 'approved', submittedAt: 'Aug 12, 2026', receiptName: 'receipt-aug12.jpg' },
  { id: 'pay-1041', userName: 'Maria Santos', userEmail: 'maria@example.com', plan: 'Premium Access', amount: 2500, reference: 'DP-88368', status: 'pending', submittedAt: 'Aug 14, 2026', receiptName: 'gcash-screenshot.png' },
  { id: 'pay-1040', userName: 'Ahmed Karim', userEmail: 'ahmed@example.com', plan: 'Premium Access', amount: 2500, reference: 'DP-88355', status: 'pending', submittedAt: 'Aug 15, 2026', receiptName: 'bank-transfer.jpg' },
  { id: 'pay-1039', userName: 'Lisa Chen', userEmail: 'lisa@example.com', plan: 'Premium Access', amount: 2500, reference: 'DP-88340', status: 'rejected', submittedAt: 'Aug 10, 2026', reason: 'Amount on receipt does not match the plan price.', receiptName: 'receipt-photo.jpg' },
]

export const attemptHistory: AttemptRecord[] = [
  { id: 'a-9', questionnaireTitle: 'Mock Test A', mode: 'mock', score: 16, total: 20, percent: 80, passed: true, completedAt: 'Aug 18, 2026', weakCategories: ['Vehicle Knowledge'] },
  { id: 'a-8', questionnaireTitle: 'Road Rules', mode: 'practice', score: 9, total: 10, percent: 90, passed: true, completedAt: 'Aug 16, 2026', weakCategories: [] },
  { id: 'a-7', questionnaireTitle: 'Mock Test A', mode: 'mock', score: 12, total: 20, percent: 60, passed: false, completedAt: 'Aug 11, 2026', weakCategories: ['Road Rules', 'Vehicle Knowledge'] },
  { id: 'a-6', questionnaireTitle: 'Traffic Signs', mode: 'practice', score: 8, total: 10, percent: 80, passed: true, completedAt: 'Aug 8, 2026', weakCategories: [] },
  { id: 'a-5', questionnaireTitle: 'Defensive Driving', mode: 'practice', score: 7, total: 10, percent: 70, passed: true, completedAt: 'Aug 4, 2026', weakCategories: ['Defensive Driving'] },
]

export const moduleMeta: Record<string, { label: string; soft: string; solid: string; text: string; bar: string; border: string }> = {
  blue: { label: 'Traffic Signs', soft: 'bg-blue-50', solid: 'bg-blue-600', text: 'text-blue-600', bar: 'bg-blue-600', border: 'border-blue-600' },
  orange: { label: 'Road Rules', soft: 'bg-amber-50', solid: 'bg-amber-500', text: 'text-amber-600', bar: 'bg-amber-500', border: 'border-amber-500' },
  green: { label: 'Defensive Driving', soft: 'bg-green-50', solid: 'bg-green-600', text: 'text-green-600', bar: 'bg-green-600', border: 'border-green-600' },
  purple: { label: 'Vehicle Knowledge', soft: 'bg-purple-50', solid: 'bg-purple-600', text: 'text-purple-600', bar: 'bg-purple-600', border: 'border-purple-600' },
}

export function questionsFor(moduleId: string): Question[] {
  return questionBank.filter((q) => q.moduleId === moduleId)
}

export function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
