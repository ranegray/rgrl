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
