import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "./models/Question.js";

dotenv.config();

const connection = await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to the database");
});

const questions = [
    { question: "What does ADAS stand for, and what is its primary purpose in modern vehicles?", answer: "ADAS stands for Advanced Driver Assistance Systems. Its primary purpose is to enhance vehicle safety and driving efficiency by assisting the driver through features like collision avoidance, lane-keeping assistance, and adaptive cruise control." },
    { question: "Name at least five ADAS features.", answer: "Adaptive Cruise Control (ACC), Lane Departure Warning (LDW), Blind Spot Detection (BSD), Collision Warning & Braking (CWB), Park Assist (PA)" },
    { question: "How does Adaptive Cruise Control (ACC) work, and how is it different from traditional cruise control?", answer: "Adaptive Cruise Control (ACC) maintains a safe following distance by adjusting vehicle speed based on traffic conditions. Unlike traditional cruise control, which maintains a set speed regardless of traffic, ACC can slow down or speed up depending on the distance from the vehicle ahead." },
    { question: "What types of sensors are used in ADAS to detect the vehicle’s surroundings?", answer: "ADAS relies on various sensors, including: Cameras (for lane detection, sign recognition), Radar sensors (for adaptive cruise control, collision detection), Ultrasonic sensors (for parking assist), Infrared sensors (for night vision systems)" },
    { question: "When is an ADAS calibration required?", answer: "ADAS calibration is required when: A sensor or camera is replaced, The windshield or bumper is repaired or replaced, The vehicle undergoes wheel alignment or suspension repairs, A diagnostic trouble code (DTC) indicates misalignment, The vehicle is involved in an accident that may have affected sensor alignment." },
    { question: "What is the difference between static and dynamic ADAS calibration?", answer: "Static Calibration is performed in a controlled environment using specialized tools, without moving the vehicle. Dynamic Calibration is conducted on the road under specific driving conditions to allow sensors to adapt to real-world scenarios." },
    { question: "What tools are necessary for an ADAS calibration?", answer: "OEM-approved calibration targets, Diagnostic scan tools, Alignment racks for precise positioning, Special mounts for radar and cameras" },
    { question: "What are the main purposes of a diagnostic scan tool in ADAS?", answer: "A scan tool is used to: Identify Diagnostic Trouble Codes (DTCs), Detect loss of communication with a module, Determine calibration requirements, Identify sensor or camera malfunctions" },
    { question: "What are some common mistakes in ADAS diagnostics?", answer: "Clearing DTCs without fixing the underlying issue, Skipping post-repair scanning, Using non-OEM scan tools that lack full ADAS coverage, Not recognizing pre-existing faults that may affect the system" },
    { question: "Why is a pre-repair scan important in ADAS collision repair?", answer: "A pre-repair scan identifies active diagnostic trouble codes (DTCs) and detects system issues before any repair work begins. This ensures that technicians are aware of existing ADAS problems that need to be addressed." },
    { question: "What must an operator verify when repairing an ADAS-equipped vehicle?", answer: "The operator must: Use OEM repair manuals, Check for active DTCs, Verify sensor and camera positions, Assess radar signal clarity and field of view" },
    { question: "Why is windshield replacement calibration necessary in ADAS vehicles?", answer: "Many ADAS-equipped vehicles have front-facing cameras mounted on the windshield. Replacing the windshield can alter the camera’s alignment, requiring recalibration to maintain system accuracy." },
    { question: "How does wheel alignment affect ADAS functionality?", answer: "Improper wheel alignment can disrupt lane departure warning systems and adaptive cruise control. Some OEMs require ADAS recalibration after an alignment to ensure accurate system operation. Even a one-degree error in calibration can lead to malfunctioning systems." },
    { question: "What are some common environmental factors that can affect ADAS performance?", answer: "Weather conditions – Snow, rain, and fog can obstruct sensors. Dirt and debris – Can block camera lenses and radar signals. Improper repairs – Misalignment of sensors after non-standard repair procedures. Surface reflectivity – Certain materials may distort radar reflections." },
    { question: "What best practices should be followed to prevent ADAS system failures?", answer: "Keep sensors and cameras clean and unobstructed. Use OEM-recommended parts and procedures. Conduct regular ADAS system checks with diagnostic tools. Ensure proper sensor mounting angles after repairs." },
    { question: "What is the role of artificial intelligence (AI) in ADAS?", answer: "AI helps ADAS by: Improving object recognition and detecting pedestrians, vehicles, and road signs. Adapting to driving patterns, making real-time adjustments. Enhancing decision-making, such as determining when to brake or steer automatically." },
    { question: "How do ADAS systems integrate with autonomous driving technologies?", answer: "ADAS systems serve as a foundation for autonomous vehicles by handling: Adaptive cruise control, Lane-keeping assistance, Automatic emergency braking, Obstacle detection and avoidance" },
    { question: "Why is post-repair scanning crucial after ADAS-related repairs?", answer: "A post-repair scan ensures that all ADAS systems are fully functional after maintenance. It verifies that no new DTCs were introduced and that calibration was successful." },
    { question: "How does Vehicle-to-Vehicle (V2V) communication enhance ADAS performance?", answer: "V2V communication allows ADAS-equipped vehicles to exchange real-time data about speed, position, and road conditions, helping prevent collisions and improving traffic flow." },
    { question: "What future trends are expected in ADAS development?", answer: "Future advancements in ADAS include: Integration with fully autonomous driving, Enhanced pedestrian and cyclist detection, Augmented reality (AR) heads-up displays, More sophisticated AI-driven navigation and decision-making systems" }
  ];

await Question.insertMany(questions);
console.log(`Database populated with ${questions.length} questions.`);
mongoose.connection.close();
