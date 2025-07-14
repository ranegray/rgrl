import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import {
  courses, modules, moduleContent, lessons, exercises, steps,
  quizzes, quizQuestions, userProgress, userExerciseProgress
} from './schema';

export const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log('🌱 Starting seed...');

  try {
    // Clear existing data (be careful in production!)
    console.log('Clearing existing data...');
    await db.delete(userExerciseProgress);
    await db.delete(userProgress);
    await db.delete(quizQuestions);
    await db.delete(quizzes);
    await db.delete(steps);
    await db.delete(exercises);
    await db.delete(lessons);
    await db.delete(moduleContent);
    await db.delete(modules);
    await db.delete(courses);

    // Create a comprehensive ROS2 course
    console.log('Creating course...');
    const [course] = await db.insert(courses).values({
      title: 'ROS2 Fundamentals',
      slug: 'ros2-fundamentals',
      description: 'Master ROS2 from basics to advanced navigation and manipulation. Build real robot applications step by step.',
      isPublished: true,
    }).returning();

    // ===== MODULE 1: Getting Started =====
    console.log('Creating Module 1: Getting Started...');
    const [gettingStartedModule] = await db.insert(modules).values({
      courseId: course.id,
      title: 'Getting Started with ROS2',
      slug: 'getting-started',
      description: 'Learn the fundamentals of ROS2 and set up your development environment.',
      orderIndex: 0,
      isSequential: true,
      estimatedDuration: 120, // 2 hours
      isPublished: true,
    }).returning();

    // Introduction Video
    const [introVideoContent] = await db.insert(moduleContent).values({
      moduleId: gettingStartedModule.id,
      title: 'Welcome to ROS2',
      slug: 'welcome-video',
      description: 'Overview of what you\'ll learn and why ROS2 matters in robotics.',
      contentType: 'video',
      orderIndex: 0,
      estimatedDuration: 15,
      isPublished: true,
      metadata: {
        videoUrl: 'https://example.com/ros2-intro.mp4',
        transcript: 'Welcome to ROS2 Fundamentals...',
        chapters: [
          { title: 'What is ROS2?', timestamp: 0 },
          { title: 'Course Overview', timestamp: 300 },
          { title: 'Prerequisites', timestamp: 600 }
        ]
      }
    }).returning();

    // First Interactive Lesson
    const [firstLessonContent] = await db.insert(moduleContent).values({
      moduleId: gettingStartedModule.id,
      title: 'Your First ROS2 Node',
      slug: 'first-node',
      description: 'Create and run your first ROS2 node in Python.',
      contentType: 'lesson',
      orderIndex: 1,
      estimatedDuration: 45,
      isPublished: true,
    }).returning();

    const [firstLesson] = await db.insert(lessons).values({
      moduleContentId: firstLessonContent.id,
      executionEnvironment: 'ros2-gazebo-classic',
      environmentConfig: {
        packages: ['rclpy', 'std_msgs'],
        workspace: '/home/student/ros2_ws',
        autoSource: true
      },
      content: `# Your First ROS2 Node

In this lesson, you'll create your first ROS2 node and learn the fundamental concepts of the ROS2 architecture.

## What You'll Learn
- How to create a ROS2 node
- Understanding the node lifecycle
- Basic ROS2 Python syntax

Let's get started!`
    }).returning();

    // Exercise 1: Basic Node Creation
    const [exercise1] = await db.insert(exercises).values({
      lessonId: firstLesson.id,
      title: 'Create a Basic Node',
      slug: 'basic-node',
      description: 'Set up the basic structure of a ROS2 node.',
      orderIndex: 0,
      initialCode: `#!/usr/bin/env python3
# Your first ROS2 program

# TODO: Import the necessary ROS2 libraries

def main():
    # TODO: Initialize ROS2
    
    # TODO: Create a node
    
    # TODO: Keep the node running
    pass

if __name__ == '__main__':
    main()`,
      solutionCode: `#!/usr/bin/env python3
import rclpy
from rclpy.node import Node

def main():
    rclpy.init()
    node = Node('my_first_node')
    
    node.get_logger().info('Hello from ROS2!')
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()`,
      estimatedDuration: 20,
      isPublished: true,
    }).returning();

    await db.insert(steps).values([
      {
        exerciseId: exercise1.id,
        title: 'Import ROS2 Libraries',
        orderIndex: 0,
        instructions: `First, let's import the essential ROS2 Python libraries.

Add these imports at the top of your file:
- \`rclpy\` - The main ROS2 Python library
- \`Node\` from \`rclpy.node\` - The base class for all nodes`,
        hint: 'Remember to import both rclpy and the Node class.',
        validationType: 'string_contains',
        validationConfig: {
          validationStrings: ['import rclpy', 'from rclpy.node import Node']
        },
        points: 10,
      },
      {
        exerciseId: exercise1.id,
        title: 'Initialize ROS2',
        orderIndex: 1,
        instructions: `Before creating any nodes, you must initialize the ROS2 system.

In the main() function, add the line to initialize ROS2.`,
        hint: 'Use rclpy.init() to initialize the ROS2 system.',
        codeHint: 'rclpy.init()',
        validationType: 'string_contains',
        validationConfig: {
          validationStrings: ['rclpy.init()']
        },
        points: 10,
      },
      {
        exerciseId: exercise1.id,
        title: 'Create Your Node',
        orderIndex: 2,
        instructions: `Now create a node instance with the name 'my_first_node'.

Assign it to a variable called \`node\`.`,
        hint: 'Create a Node object with a string name as the parameter.',
        codeHint: 'node = Node(\'my_first_node\')',
        validationType: 'string_contains',
        validationConfig: {
          validationStrings: ['node = Node(', 'my_first_node']
        },
        points: 15,
      },
      {
        exerciseId: exercise1.id,
        title: 'Add Logging',
        orderIndex: 3,
        instructions: `Let's add a log message so we know our node is running.

Use the node's logger to print "Hello from ROS2!".`,
        hint: 'Use node.get_logger().info() to log a message.',
        codeHint: 'node.get_logger().info(\'Hello from ROS2!\')',
        validationType: 'string_contains',
        validationConfig: {
          validationStrings: ['node.get_logger().info', 'Hello from ROS2!']
        },
        points: 10,
      },
      {
        exerciseId: exercise1.id,
        title: 'Keep Node Running',
        orderIndex: 4,
        instructions: `Finally, we need to keep the node running so it can receive and process messages.

Add the spin call and proper cleanup in a try-except block.`,
        hint: 'Use rclpy.spin(node) to keep the node running, and handle cleanup in a finally block.',
        validationType: 'string_contains',
        validationConfig: {
          validationStrings: ['rclpy.spin(node)', 'node.destroy_node()', 'rclpy.shutdown()']
        },
        points: 15,
      }
    ]);

    // Knowledge Check Quiz
    const [quizContent] = await db.insert(moduleContent).values({
      moduleId: gettingStartedModule.id,
      title: 'ROS2 Basics Quiz',
      slug: 'basics-quiz',
      description: 'Test your understanding of ROS2 fundamentals.',
      contentType: 'quiz',
      orderIndex: 2,
      estimatedDuration: 10,
      isPublished: true,
    }).returning();

    const [quiz] = await db.insert(quizzes).values({
      moduleContentId: quizContent.id,
      passingScore: 70,
      allowRetakes: true,
      timeLimit: 15, // 15 minutes
    }).returning();

    await db.insert(quizQuestions).values([
      {
        quizId: quiz.id,
        questionText: 'What is the purpose of rclpy.init()?',
        questionType: 'multiple_choice',
        orderIndex: 0,
        points: 20,
        correctAnswers: ['Initialize the ROS2 system'],
        options: [
          'Initialize the ROS2 system',
          'Create a new node',
          'Start message publishing',
          'Connect to the robot'
        ],
        explanation: 'rclpy.init() must be called before creating any nodes or using ROS2 functionality.'
      },
      {
        quizId: quiz.id,
        questionText: 'A ROS2 node must have a unique name within the same namespace.',
        questionType: 'true_false',
        orderIndex: 1,
        points: 15,
        correctAnswers: ['true'],
        explanation: 'Each node must have a unique name within its namespace to avoid conflicts.'
      },
      {
        quizId: quiz.id,
        questionText: 'What method keeps a ROS2 node running and responsive?',
        questionType: 'short_answer',
        orderIndex: 2,
        points: 25,
        correctAnswers: ['rclpy.spin', 'spin'],
        explanation: 'rclpy.spin() keeps the node running and processing callbacks.'
      }
    ]);

    // ===== MODULE 2: Communication =====
    console.log('Creating Module 2: Communication...');
    const [communicationModule] = await db.insert(modules).values({
      courseId: course.id,
      title: 'ROS2 Communication',
      slug: 'communication',
      description: 'Learn how nodes communicate using topics, services, and actions.',
      orderIndex: 1,
      isSequential: false, // Can do in any order
      estimatedDuration: 180, // 3 hours
      isPublished: true,
    }).returning();

    // Article: Communication Concepts
    const [articleContent] = await db.insert(moduleContent).values({
      moduleId: communicationModule.id,
      title: 'Understanding ROS2 Communication',
      slug: 'communication-concepts',
      description: 'Deep dive into topics, services, and actions.',
      contentType: 'article',
      orderIndex: 0,
      estimatedDuration: 20,
      isPublished: true,
      metadata: {
        content: `# ROS2 Communication Patterns

ROS2 provides three main communication patterns:

## Topics (Publish/Subscribe)
- **Asynchronous** communication
- **Many-to-many** relationship
- Best for continuous data streams (sensor data, robot state)
- **Fire and forget** - publishers don't wait for confirmation

## Services (Request/Response)
- **Synchronous** communication  
- **One-to-one** relationship
- Best for triggering actions or getting specific information
- **Blocking** - client waits for response

## Actions (Goal/Feedback/Result)
- **Asynchronous** with feedback
- **One-to-one** relationship
- Best for long-running tasks
- Provides **progress updates** and **cancellation**

## When to Use What?

| Pattern | Use Case | Example |
|---------|----------|---------|
| Topic | Continuous data | Camera feeds, sensor readings |
| Service | Quick requests | "What's the battery level?" |
| Action | Long tasks | "Navigate to kitchen" |

Understanding these patterns is crucial for designing effective robot systems.`
      }
    }).returning();

    // Publishers and Subscribers Lesson
    const [pubsubLessonContent] = await db.insert(moduleContent).values({
      moduleId: communicationModule.id,
      title: 'Publishers and Subscribers',
      slug: 'pubsub',
      description: 'Create nodes that publish and subscribe to topics.',
      contentType: 'lesson',
      orderIndex: 1,
      estimatedDuration: 60,
      isPublished: true,
    }).returning();

    const [pubsubLesson] = await db.insert(lessons).values({
      moduleContentId: pubsubLessonContent.id,
      executionEnvironment: 'ros2-gazebo-classic',
      environmentConfig: {
        packages: ['rclpy', 'std_msgs', 'geometry_msgs'],
        tools: ['ros2 topic list', 'ros2 topic echo'],
        preRunCommands: ['source /opt/ros/humble/setup.bash']
      },
      content: `# Publishers and Subscribers

Topics are the most common way for ROS2 nodes to communicate. Let's create a publisher that sends messages and a subscriber that receives them.

## Learning Objectives
- Create a publisher node
- Create a subscriber node  
- Understand message types
- Use ROS2 command-line tools

Ready to start communicating?`
    }).returning();

    // Publisher Exercise
    const [publisherExercise] = await db.insert(exercises).values({
      lessonId: pubsubLesson.id,
      title: 'Create a Publisher',
      slug: 'publisher',
      description: 'Build a node that publishes messages to a topic.',
      orderIndex: 0,
      initialCode: `#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
# TODO: Import the String message type

class PublisherNode(Node):
    def __init__(self):
        super().__init__('publisher_node')
        
        # TODO: Create a publisher for String messages on the 'chatter' topic
        
        # TODO: Create a timer that calls publish_message every 1 second
        
        self.counter = 0
    
    def publish_message(self):
        # TODO: Create and publish a message
        pass

def main():
    rclpy.init()
    node = PublisherNode()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()`,
      solutionCode: `#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class PublisherNode(Node):
    def __init__(self):
        super().__init__('publisher_node')
        
        self.publisher = self.create_publisher(String, 'chatter', 10)
        self.timer = self.create_timer(1.0, self.publish_message)
        self.counter = 0
    
    def publish_message(self):
        msg = String()
        msg.data = f'Hello ROS2! Message #{self.counter}'
        self.publisher.publish(msg)
        self.get_logger().info(f'Published: {msg.data}')
        self.counter += 1

def main():
    rclpy.init()
    node = PublisherNode()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()`,
      estimatedDuration: 25,
      isPublished: true,
    }).returning();

    await db.insert(steps).values([
      {
        exerciseId: publisherExercise.id,
        title: 'Import Message Type',
        orderIndex: 0,
        instructions: 'Import the String message type from std_msgs.msg',
        validationType: 'string_contains',
        validationConfig: {
          validationStrings: ['from std_msgs.msg import String']
        },
        points: 10,
      },
      {
        exerciseId: publisherExercise.id,
        title: 'Create Publisher',
        orderIndex: 1,
        instructions: 'In the __init__ method, create a publisher for String messages on the "chatter" topic with queue size 10.',
        hint: 'Use self.create_publisher(MessageType, topic_name, queue_size)',
        validationType: 'string_contains',
        validationConfig: {
          validationStrings: ['self.create_publisher(String,', 'chatter', '10)']
        },
        points: 15,
      },
      {
        exerciseId: publisherExercise.id,
        title: 'Create Timer',
        orderIndex: 2,
        instructions: 'Create a timer that calls publish_message every 1.0 seconds.',
        hint: 'Use self.create_timer(period, callback_function)',
        validationType: 'string_contains',
        validationConfig: {
          validationStrings: ['self.create_timer(1.0,', 'publish_message)']
        },
        points: 15,
      },
      {
        exerciseId: publisherExercise.id,
        title: 'Implement Message Publishing',
        orderIndex: 3,
        instructions: 'In publish_message, create a String message, set its data, publish it, and log the message.',
        validationType: 'string_contains',
        validationConfig: {
          validationStrings: ['msg = String()', 'msg.data =', 'self.publisher.publish(msg)', 'self.get_logger().info']
        },
        points: 20,
      }
    ]);

    // ===== MODULE 3: Robot Control =====
    console.log('Creating Module 3: Robot Control...');
    const [robotControlModule] = await db.insert(modules).values({
      courseId: course.id,
      title: 'Robot Control and Movement',
      slug: 'robot-control',
      description: 'Control simulated and real robots using ROS2.',
      orderIndex: 2,
      isSequential: true,
      estimatedDuration: 240, // 4 hours
      isPublished: true,
    }).returning();

    // Project: Build a Patrol Bot
    const [projectContent] = await db.insert(moduleContent).values({
      moduleId: robotControlModule.id,
      title: 'Project: Patrol Bot',
      slug: 'patrol-bot-project',
      description: 'Build a robot that patrols a defined area autonomously.',
      contentType: 'project',
      orderIndex: 0,
      estimatedDuration: 120,
      isPublished: true,
      metadata: {
        instructions: `# Patrol Bot Project

## Objective
Create a ROS2 node that makes a robot patrol between waypoints in a simulated environment.

## Requirements
1. Robot should move between at least 3 waypoints
2. Robot should rotate to face the next waypoint before moving
3. Robot should stop for 5 seconds at each waypoint
4. Include obstacle avoidance (bonus)

## Deliverables
- Functioning patrol_bot.py node
- Launch file to start simulation
- README with usage instructions

## Grading Rubric
- **Movement (40%)**: Robot successfully moves between waypoints
- **Rotation (20%)**: Robot orients toward targets
- **Timing (20%)**: Proper wait times at waypoints  
- **Code Quality (20%)**: Clean, well-commented code`,
        submissionType: 'code_upload',
        estimatedHours: 2,
        rubric: [
          { criteria: 'Waypoint Navigation', maxPoints: 40 },
          { criteria: 'Orientation Control', maxPoints: 20 },
          { criteria: 'Timing Logic', maxPoints: 20 },
          { criteria: 'Code Quality', maxPoints: 20 }
        ]
      }
    }).returning();

    console.log('✅ Seed data created successfully!');
    console.log(`
📊 Created:
- 1 Course: ${course.title}
- 3 Modules with different content types
- Interactive lessons with exercises and steps  
- Quizzes with multiple question types
- Articles and videos
- A capstone project

🎯 Content Types Demonstrated:
- Video (with metadata for chapters, transcript)
- Lesson (with coding exercises and validation)
- Quiz (multiple choice, true/false, short answer)
- Article (markdown content)
- Project (with rubric and submission requirements)

🔗 Hierarchy:
Course → Module → Content → [Lessons → Exercises → Steps] | [Quiz → Questions]
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Export the seed function for explicit invocation
export { seed };
