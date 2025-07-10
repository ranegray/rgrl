import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { courses, lessons, steps } from './schema';

export const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log('🌱 Starting seed...');

  try {
    // Clear existing data (be careful in production!)
    console.log('Clearing existing data...');
    await db.delete(steps);
    await db.delete(lessons);
    await db.delete(courses);

    // Create a course
    console.log('Creating course...');
    const [course] = await db.insert(courses).values({
      title: 'ROS2 Fundamentals',
      slug: 'ros2-fundamentals',
      description: 'Learn ROS2 from scratch by building real robot applications.',
      isPublished: true,
    }).returning();

    // Create first lesson
    console.log('Creating lesson...');
    const [lesson] = await db.insert(lessons).values({
      courseId: course.id,
      title: 'First Connection',
      slug: 'first-connection',
      orderIndex: 0,
      content: '# Welcome to ROS2!\n\nIn this lesson, you\'ll make your first connection to a robot and make it move.',
    }).returning();

    // Create steps
    console.log('Creating steps...');
    await db.insert(steps).values([
      {
        lessonId: lesson.id,
        title: 'Import ROS2',
        orderIndex: 0,
        instructions: 'First, let\'s import the ROS2 Python library.\n\nAdd this line at the top of your file:\n```python\nimport rclpy\n```',
        initialCode: '#!/usr/bin/env python3\n# Your first ROS2 program\n\n# TODO: Import rclpy here\n',
        solutionCode: '#!/usr/bin/env python3\n# Your first ROS2 program\n\nimport rclpy\n',
        validationStrings: ['import rclpy'],
      },
      {
        lessonId: lesson.id,
        title: 'Create a Node',
        orderIndex: 1,
        instructions: 'Now let\'s create a ROS2 node.\n\nAdd these imports and create a simple node class:\n```python\nfrom rclpy.node import Node\n\nclass MyFirstNode(Node):\n    def __init__(self):\n        super().__init__(\'my_first_node\')\n```',
        initialCode: '#!/usr/bin/env python3\nimport rclpy\n# TODO: Import Node class\n\n# TODO: Create MyFirstNode class\n',
        solutionCode: '#!/usr/bin/env python3\nimport rclpy\nfrom rclpy.node import Node\n\nclass MyFirstNode(Node):\n    def __init__(self):\n        super().__init__(\'my_first_node\')\n',
        validationStrings: ['from rclpy.node import Node', 'class MyFirstNode', 'super().__init__'],
      },
      {
        lessonId: lesson.id,
        title: 'Run Your Node',
        orderIndex: 2,
        instructions: 'Finally, let\'s create a main function to run our node.\n\nAdd this code:\n```python\ndef main():\n    rclpy.init()\n    node = MyFirstNode()\n    print("Node is running!")\n    rclpy.spin(node)\n    rclpy.shutdown()\n\nif __name__ == \'__main__\':\n    main()\n```',
        initialCode: '#!/usr/bin/env python3\nimport rclpy\nfrom rclpy.node import Node\n\nclass MyFirstNode(Node):\n    def __init__(self):\n        super().__init__(\'my_first_node\')\n\n# TODO: Create main function\n',
        solutionCode: '#!/usr/bin/env python3\nimport rclpy\nfrom rclpy.node import Node\n\nclass MyFirstNode(Node):\n    def __init__(self):\n        super().__init__(\'my_first_node\')\n\ndef main():\n    rclpy.init()\n    node = MyFirstNode()\n    print("Node is running!")\n    rclpy.spin(node)\n    rclpy.shutdown()\n\nif __name__ == \'__main__\':\n    main()\n',
        validationStrings: ['def main()', 'rclpy.init()', 'MyFirstNode()', 'rclpy.spin', 'rclpy.shutdown()'],
      },
    ]);

    // --- Introduction to Robotics ---
    const introRoboticsCourse = await db
      .insert(courses)
      .values({
        title: "Introduction to Robotics",
        slug: "introduction-to-robotics",
        description: "Start your journey with the fundamental concepts of robotics.",
      })
      .returning({ id: courses.id });

    const introRoboticsLesson1 = await db
      .insert(lessons)
      .values({
        courseId: introRoboticsCourse[0].id,
        orderIndex: 0,
        title: "What is a Robot?",
        slug: "what-is-a-robot",
        content: "Explore the definition of a robot and its various applications in the real world.",
      })
      .returning({ id: lessons.id });

    await db.insert(steps).values([
      {
        lessonId: introRoboticsLesson1[0].id,
        orderIndex: 0,
        title: "Key Characteristics",
        instructions: "Write a comment in Python listing the three key characteristics of a robot: Sense, Think, Act.",
        initialCode: "# Your list here",
        solutionCode: "# 1. Sense\n# 2. Think\n# 3. Act",
        validationStrings: JSON.stringify(["Sense", "Think", "Act"]),
      },
    ]);

    const introRoboticsLesson2 = await db
      .insert(lessons)
      .values({
        courseId: introRoboticsCourse[0].id,
        orderIndex: 1,
        title: "Components of a Robot",
        slug: "components-of-a-robot",
        content: "Learn about the essential hardware components that make up a robot.",
      })
      .returning({ id: lessons.id });

    await db.insert(steps).values([
      {
        lessonId: introRoboticsLesson2[0].id,
        orderIndex: 0,
        title: "Identify Components",
        instructions: "Create string variables for the following components: `sensor`, `actuator`, `controller`.",
        initialCode: "# Define your variables",
        solutionCode: "sensor = 'camera'\nactuator = 'motor'\ncontroller = 'raspberry pi'",
        validationStrings: JSON.stringify(["sensor", "actuator", "controller"]),
      },
    ]);


    // --- Robot Kinematics ---
    const kinematicsCourse = await db
      .insert(courses)
      .values({
        title: "Robot Kinematics",
        slug: "robot-kinematics",
        description: "Understand the mathematics of robot motion, position, and orientation.",
      })
      .returning({ id: courses.id });

    const kinematicsLesson1 = await db
      .insert(lessons)
      .values({
        courseId: kinematicsCourse[0].id,
        orderIndex: 0,
        title: "Forward Kinematics",
        slug: "forward-kinematics",
        content: "Calculate the end-effector position given the joint parameters of a robot arm.",
      })
      .returning({ id: lessons.id });

    await db.insert(steps).values([
      {
        lessonId: kinematicsLesson1[0].id,
        orderIndex: 0,
        title: "2-Link Arm Calculation",
        instructions: "Given a 2-link planar arm with link lengths l1=10 and l2=5, and joint angles theta1=0.5 rad and theta2=0.2 rad, calculate the (x, y) position of the end-effector. Use the `math` library.",
        initialCode: "import math\n\nl1 = 10\nl2 = 5\ntheta1 = 0.5\ntheta2 = 0.2\n\n# Your code here\n# x = ...\n# y = ...\n\n# print(f'x: {x}, y: {y}')",
        solutionCode: "import math\n\nl1 = 10\nl2 = 5\ntheta1 = 0.5\ntheta2 = 0.2\n\nx = l1 * math.cos(theta1) + l2 * math.cos(theta1 + theta2)\ny = l1 * math.sin(theta1) + l2 * math.sin(theta1 + theta2)\n\nprint(f'x: {x}, y: {y}')",
        validationStrings: JSON.stringify(["13.62", "8.28"]),
      },
    ]);


    // --- Computer Vision for Robotics ---
    const compVisCourse = await db
      .insert(courses)
      .values({
        title: "Computer Vision for Robotics",
        slug: "computer-vision-for-robotics",
        description: "Enable robots to 'see' and interpret the world using cameras and image processing.",
      })
      .returning({ id: courses.id });

    const compVisLesson1 = await db
      .insert(lessons)
      .values({
        courseId: compVisCourse[0].id,
        orderIndex: 0,
        title: "Image Processing Basics",
        slug: "image-processing-basics",
        content: "Learn how to manipulate and analyze digital images.",
      })
      .returning({ id: lessons.id });

    await db.insert(steps).values([
      {
        lessonId: compVisLesson1[0].id,
        orderIndex: 0,
        title: "Grayscale Conversion",
        instructions: "Imagine you have an RGB pixel with values (R=50, G=100, B=150). Calculate the grayscale value using the luminosity method: 0.299*R + 0.587*G + 0.114*B. Print the result.",
        initialCode: "R = 50\nG = 100\nB = 150\n\n# Calculate and print the grayscale value",
        solutionCode: "R = 50\nG = 100\nB = 150\n\ngrayscale = 0.299*R + 0.587*G + 0.114*B\nprint(grayscale)",
        validationStrings: JSON.stringify(["90.75"]),
      },
    ]);

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run the seed function
seed().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});
