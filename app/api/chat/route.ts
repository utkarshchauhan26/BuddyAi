import type { NextRequest } from "next/server"

// Simple configuration - focus on reliability over complexity

// Simple, reliable AI that works without external dependencies
async function querySimpleAI(userMessage: string): Promise<string> {
  // Try one simple HuggingFace model without auth
  try {
    console.log("🤖 Trying simple HuggingFace API...")
    
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: userMessage,
          parameters: { max_new_tokens: 100, temperature: 0.7 }
        })
      }
    )

    if (response.ok) {
      const result = await response.json()
      if (result && result[0]?.generated_text) {
        console.log("✅ HuggingFace API worked!")
        return result[0].generated_text.replace(userMessage, "").trim()
      }
    }
  } catch (error) {
    console.log("❌ HuggingFace failed:", error)
  }

  // Fallback: Enhanced AI system with roadmap generation
  console.log("🧠 Using enhanced local AI with roadmap capabilities...")
  return generateIntelligentResponse(userMessage)
}

// Enhanced roadmap detection functions
function isRoadmapRequest(lowerText: string): boolean {
  const roadmapKeywords = [
    'roadmap', 'learning path', 'study plan', 'curriculum', 'course outline',
    'step by step', 'how to learn', 'learning guide', 'plan to', 'path to'
  ]
  
  const goalKeywords = [
    'learn', 'master', 'become', 'get good at', 'understand', 'study'
  ]
  
  const timeKeywords = ['week', 'month', 'day', 'timeline', 'schedule']
  
  return roadmapKeywords.some(keyword => lowerText.includes(keyword)) ||
         (goalKeywords.some(goal => lowerText.includes(goal)) && 
          timeKeywords.some(time => lowerText.includes(time)))
}

function isImportedRoadmap(lowerText: string): boolean {
  const importKeywords = ['here is my plan', 'paste this plan', 'import this', 'use this roadmap', 'follow this plan']
  return importKeywords.some(keyword => lowerText.includes(keyword)) || 
         (lowerText.includes('day') && lowerText.includes(':')) // Likely a plan format
}

function generateRoadmapResponse(userText: string): string {
  const goalText = extractGoalFromText(userText)
  
  // Check if user provided complete info for roadmap generation
  const hasTimeline = /(\d+)\s*(week|month|day)s?/i.test(userText)
  const hasLevel = /(beginner|intermediate|advanced)/i.test(userText)
  const hasTime = /(\d+)\s*(hour|min)/i.test(userText)
  
  if (hasTimeline && hasLevel && hasTime) {
    // Extract details
    const timelineMatch = userText.match(/(\d+)\s*(week|month|day)s?/i)
    const levelMatch = userText.match(/(beginner|intermediate|advanced)/i)
    const timeMatch = userText.match(/(\d+)\s*(hour|min)/i)
    
    const timeline = timelineMatch ? `${timelineMatch[1]} ${timelineMatch[2]}${timelineMatch[1] !== '1' ? 's' : ''}` : '3 months'
    const level = levelMatch ? levelMatch[1].charAt(0).toUpperCase() + levelMatch[1].slice(1) : 'Intermediate'
    const dailyTime = timeMatch ? `${timeMatch[1]} ${timeMatch[2]}${timeMatch[1] !== '1' && timeMatch[2] === 'hour' ? 's' : ''}` : '2 hours'
    
    // Create the roadmap data structure to send to client
    const roadmapData = {
      title: `${goalText} Learning Path`,
      description: `A ${level.toLowerCase()} level roadmap to ${goalText.toLowerCase()} in ${timeline}`,
      category: 'Learning',
      difficulty: level as 'Beginner' | 'Intermediate' | 'Advanced',
      duration: timeline,
      progress: 0,
      completed: false,
      steps: generateRoadmapSteps(goalText, level, timeline)
    }
    
    // Return structured response that client can parse
    return `🎯 **Roadmap Created!**

**${goalText} - ${timeline} (${level})**
${dailyTime} daily commitment

**ROADMAP_DATA_START**
${JSON.stringify(roadmapData)}
**ROADMAP_DATA_END**

✅ **Next Steps:**
• Visit **Roadmaps tab** to view your plan
• Daily tasks will be auto-generated from each step
• Track progress and mark milestones complete

💡 **Custom Roadmaps:** Have your own plan? Just paste it and I'll convert it into trackable daily tasks!

🚀 Ready to begin? Your learning journey starts now!`
  }
  
  // Default response if not enough information provided
  return `🗺️ **ROADMAP GENERATOR ACTIVATED!** 

I'll create a personalized roadmap for you! Here's what I need:

📋 **Your Goal:** ${goalText}
⏰ **Timeline:** How long do you want this to take? (weeks/months)
📊 **Current Level:** Beginner, Intermediate, or Advanced?
🎯 **Daily Time:** How much time can you dedicate daily?

**Example Request:**
"Create a roadmap to learn JavaScript in 3 months, 2 hours daily, I'm a beginner"

Once you give me these details, I'll generate:
✅ **Daily action steps**
✅ **Weekly milestones** 
✅ **Progress checkpoints**
✅ **Resource recommendations**
✅ **Motivation reminders**

**Ready to build your success path?** 🚀`
}

function handleRoadmapImport(userText: string): string {
  // Try to parse if it's an actual roadmap with steps
  const lines = userText.split('\n').filter(line => line.trim())
  const hasSteps = lines.some(line => 
    line.includes('day ') || line.includes('week ') || line.includes('step ') || 
    /^\d+\./.test(line.trim()) || /^-/.test(line.trim())
  )

  if (hasSteps && lines.length >= 3) {
    // Generate roadmap from custom input
    const customRoadmapData = parseCustomRoadmap(userText)
    
    return `� **Custom Roadmap Imported!**

**"${customRoadmapData.title}"**
${customRoadmapData.steps.length} steps • ${customRoadmapData.duration}

**ROADMAP_DATA_START**
${JSON.stringify(customRoadmapData)}
**ROADMAP_DATA_END**

✅ **Your plan is now trackable:**
• Each step converted to daily tasks
• Progress tracking enabled
• Milestone celebrations added

🎯 Check your **Roadmaps tab** to start following your custom plan!`
  }

  return `📥 **Custom Roadmap Assistant**

I can help you convert any learning plan into a trackable roadmap!

**Just paste your plan like this:**
\`\`\`
Week 1: Learn HTML basics
Week 2: CSS styling 
Week 3: JavaScript fundamentals
Week 4: Build first project
\`\`\`

**Or this format:**
\`\`\`
1. Setup development environment
2. Study core concepts (2 weeks)
3. Practice with exercises
4. Build portfolio project
\`\`\`

I'll automatically:
• Break it into daily tasks
• Add progress tracking
• Set up milestone rewards
• Create completion celebrations

**Ready to paste your custom roadmap?** 📋`
}

function parseCustomRoadmap(text: string) {
  const lines = text.split('\n').filter(line => line.trim())
  const steps = []
  
  // Extract title from first line or generate one
  const firstLine = lines[0]?.trim() || ''
  const title = firstLine.length > 50 ? 'Custom Learning Plan' : 
                firstLine.replace(/^(week|day|step)\s*\d*:?\s*/i, '') || 'Custom Learning Plan'
  
  // Parse each line into steps
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length < 5) continue
    
    // Extract duration from text
    let duration = '1 week'
    const weekMatch = trimmed.match(/(\d+)\s*weeks?/i)
    const dayMatch = trimmed.match(/(\d+)\s*days?/i)
    
    if (weekMatch) {
      duration = `${weekMatch[1]} week${weekMatch[1] !== '1' ? 's' : ''}`
    } else if (dayMatch) {
      duration = `${dayMatch[1]} day${dayMatch[1] !== '1' ? 's' : ''}`
    }
    
    // Clean the title
    const stepTitle = trimmed
      .replace(/^(week|day|step)\s*\d*:?\s*/i, '')
      .replace(/\(\d+\s*(week|day)s?\)/i, '')
      .replace(/^\d+\.\s*/, '')
      .replace(/^-\s*/, '')
      .trim()
    
    if (stepTitle.length < 3) continue
    
    const stepDescription = stepTitle.length > 50 ? 
      stepTitle.substring(0, 50) + '...' : 
      `Focus on ${stepTitle.toLowerCase()}`
    
    steps.push({
      id: crypto.randomUUID(),
      title: stepTitle.length > 60 ? stepTitle.substring(0, 60) + '...' : stepTitle,
      description: stepDescription,
      duration: duration,
      completed: false
    })
  }
  
  // If no valid steps found, create a basic structure
  if (steps.length === 0) {
    steps.push({
      id: crypto.randomUUID(),
      title: 'Getting Started',
      description: 'Begin your custom learning journey',
      duration: '1 week',
      completed: false
    })
  }
  
  const totalWeeks = steps.reduce((acc, step) => {
    const weeks = step.duration.includes('week') ? 
      parseInt(step.duration.match(/\d+/)?.[0] || '1') : 
      Math.ceil(parseInt(step.duration.match(/\d+/)?.[0] || '7') / 7)
    return acc + weeks
  }, 0)
  
  return {
    title: title,
    description: `Custom roadmap with ${steps.length} steps`,
    category: 'Custom',
    difficulty: 'Intermediate' as const,
    duration: `${totalWeeks} week${totalWeeks !== 1 ? 's' : ''}`,
    progress: 0,
    completed: false,
    steps: steps
  }
}

function extractGoalFromText(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('learn')) {
    const match = text.match(/learn\s+([^.!?]+)/i)
    return match ? match[1].trim() : 'your learning goal'
  }
  
  if (lowerText.includes('become')) {
    const match = text.match(/become\s+([^.!?]+)/i)
    return match ? match[1].trim() : 'your career goal'
  }
  
  if (lowerText.includes('master')) {
    const match = text.match(/master\s+([^.!?]+)/i)
    return match ? match[1].trim() : 'your mastery goal'
  }
  
  return 'your goal'
}

function generateRoadmapSteps(goal: string, level: string, timeline: string) {
  const steps = []
  const stepCount = timeline.includes('week') ? 4 : timeline.includes('month') ? 5 : 6
  
  // Generate dynamic steps based on goal and level
  if (goal.toLowerCase().includes('javascript') || goal.toLowerCase().includes('js')) {
    steps.push(
      { id: crypto.randomUUID(), title: 'JavaScript Fundamentals', description: 'Variables, functions, arrays, objects', duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'DOM Manipulation', description: 'Interact with web pages dynamically', duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'Async JavaScript', description: 'Promises, async/await, fetch API', duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'Modern JavaScript', description: 'ES6+, modules, build tools', duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'Build Projects', description: 'Create portfolio projects', duration: '2 weeks', completed: false }
    )
  } else if (goal.toLowerCase().includes('react')) {
    steps.push(
      { id: crypto.randomUUID(), title: 'React Basics', description: 'Components, JSX, props, state', duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'React Hooks', description: 'useState, useEffect, custom hooks', duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'State Management', description: 'Context API, Redux/Zustand', duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'React Router', description: 'Navigation and routing', duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'Full Stack App', description: 'Build complete application', duration: '2 weeks', completed: false }
    )
  } else if (goal.toLowerCase().includes('python')) {
    steps.push(
      { id: crypto.randomUUID(), title: 'Python Basics', description: 'Syntax, data types, control flow', duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'Data Structures', description: 'Lists, dictionaries, sets', duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'Object-Oriented Programming', description: 'Classes, inheritance, polymorphism', duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'Libraries & Frameworks', description: 'Popular Python libraries', duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'Build Projects', description: 'Create real applications', duration: '2 weeks', completed: false }
    )
  } else {
    // Generic learning roadmap
    steps.push(
      { id: crypto.randomUUID(), title: 'Foundation', description: `Learn the basics of ${goal}`, duration: '1 week', completed: false },
      { id: crypto.randomUUID(), title: 'Core Concepts', description: `Master essential ${goal} concepts`, duration: '2 weeks', completed: false },
      { id: crypto.randomUUID(), title: 'Hands-on Practice', description: `Apply ${goal} through exercises`, duration: '2 weeks', completed: false },
      { id: crypto.randomUUID(), title: 'Advanced Topics', description: `Explore advanced ${goal} features`, duration: '2 weeks', completed: false },
      { id: crypto.randomUUID(), title: 'Master & Apply', description: `Become proficient in ${goal}`, duration: '1 week', completed: false }
    )
  }
  
  return steps.slice(0, stepCount)
}

// Enhanced AI system with improved context awareness and formatting
function generateIntelligentResponse(userText: string): string {
  const lowerText = userText.toLowerCase().trim()
  const wordCount = userText.split(' ').length
  
  // Roadmap generation - enhanced detection
  if (isRoadmapRequest(lowerText)) {
    return generateRoadmapResponse(userText)
  }
  
  // Roadmap import detection
  if (isImportedRoadmap(lowerText)) {
    return handleRoadmapImport(userText)
  }

  // Question detection and handling
  if (lowerText.includes('?') || lowerText.startsWith('how') || lowerText.startsWith('what') || lowerText.startsWith('why') || lowerText.startsWith('when') || lowerText.startsWith('where')) {
    return handleQuestionResponse(userText)
  }
  
  // Greeting responses
  if (lowerText.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return generateGreetingResponse()
  }
  
  // Motivation and encouragement
  if (lowerText.includes('motivat') || lowerText.includes('discourag') || lowerText.includes('inspire') || lowerText.includes('stuck') || lowerText.includes('overwhelm')) {
    return generateMotivationResponse(userText)
  }
  
  // Task and productivity help
  if (lowerText.includes('task') || lowerText.includes('productive') || lowerText.includes('focus') || lowerText.includes('procrastinat') || lowerText.includes('time management')) {
    return generateProductivityResponse(userText)
  }
  
  // Learning and skill development
  if (lowerText.includes('learn') || lowerText.includes('skill') || lowerText.includes('study') || lowerText.includes('course') || lowerText.includes('tutorial')) {
    return generateLearningResponse(userText)
  }
  
  // Goal setting and planning
  if (lowerText.includes('goal') || lowerText.includes('plan') || lowerText.includes('achieve') || lowerText.includes('target') || lowerText.includes('objective')) {
    return generateGoalPlanningResponse(userText)
  }

  // Health and wellness
  if (lowerText.includes('stress') || lowerText.includes('burnout') || lowerText.includes('work-life') || lowerText.includes('balance')) {
    return generateWellnessResponse(userText)
  }

  // Career and professional development
  if (lowerText.includes('career') || lowerText.includes('job') || lowerText.includes('interview') || lowerText.includes('resume') || lowerText.includes('professional')) {
    return generateCareerResponse(userText)
  }
  
  // Default contextual response
  return generateContextualResponse(userText, wordCount)
}

function handleQuestionResponse(userText: string): string {
  const lowerText = userText.toLowerCase()
  
  if (lowerText.includes('how') && (lowerText.includes('productive') || lowerText.includes('efficient'))) {
    return `💡 **How to Be More Productive**

Great question! Here's my proven productivity framework:

## 🎯 **The POWER Method:**

**P** - **Prioritize ruthlessly**
• Use the 80/20 rule: focus on the 20% that creates 80% of results
• Tackle your hardest task when energy is highest

**O** - **Organize your environment**  
• Clear workspace = clear mind
• Use the Tasks tab to track everything

**W** - **Work in focused blocks**
• 25-minute Pomodoro sessions
• Single-task, no multitasking

**E** - **Eliminate distractions**
• Phone in another room
• Block social media during work time

**R** - **Reflect and adjust**
• Check Analytics tab for patterns
• Celebrate wins, learn from setbacks

## 🚀 **Quick Wins for Today:**
1. Choose your #1 priority task
2. Set a 25-minute timer
3. Work without interruptions
4. Take a 5-minute break
5. Repeat!

What's your biggest productivity challenge? Let's solve it together! 💪`
  }
  
  if (lowerText.includes('what') && lowerText.includes('roadmap')) {
    return `🗺️ **What Are Roadmaps?**

Think of roadmaps as your GPS for learning and achievement! 

## ✨ **What Makes Them Special:**

**Structured Learning Path**
• Break big goals into manageable steps
• Clear timeline with milestones
• Progress tracking built-in

**Personalized to You**
• Adapted to your current level
• Considers your available time
• Matches your learning style

**AI-Powered Intelligence**
• Dynamic step generation
• Smart difficulty progression
• Automatic task creation

## 🎯 **Perfect For:**
• Learning new skills (coding, languages, etc.)
• Career transitions
• Personal development goals
• Academic subjects
• Creative projects

## 🚀 **Try It Now:**
Just say: *"Create a roadmap to learn [your goal] in [timeframe]"*

**Example:** "Create a roadmap to learn Python in 2 months, 1 hour daily, I'm a beginner"

Ready to build your success path? 🌟`
  }

  // Generic question response
  return `🤔 **Great Question!**

I'd love to help you with that! Here's what I can assist with:

## 🎯 **My Expertise Areas:**

**📚 Learning & Skills**
• Roadmap creation for any skill
• Study strategies and techniques
• Resource recommendations

**📋 Task Management** 
• Productivity systems and methods
• Time blocking and scheduling
• Focus and concentration tips

**🚀 Goal Achievement**
• SMART goal setting
• Action plan development  
• Progress tracking strategies

**💪 Motivation & Mindset**
• Overcoming procrastination
• Building consistency
• Maintaining momentum

## 💡 **Pro Tip:**
The more specific your question, the better I can help! Try asking something like:
• "How do I stay focused while working from home?"
• "What's the best way to learn JavaScript?"
• "Help me plan my daily schedule"

What specific challenge can I help you tackle? 🌟`
}

function generateGreetingResponse(): string {
  const greetings = [
    `Hello there! 👋 I'm Sara, your AI productivity companion! 

✨ **Ready to make today amazing?** Here's how I can help:

🎯 **Quick Actions:**
• Create learning roadmaps
• Organize your tasks  
• Get motivated and focused
• Track your progress

💡 **Try saying:**
• "Create a roadmap to learn [skill]"
• "Help me plan my day"
• "I need some motivation"

What would you like to accomplish today? Let's make it happen! 🚀`,

    `Hey! 🌟 Welcome to your productivity hub!

I'm Sara, and I'm here to help you crush your goals and build amazing habits! 

## 🚀 **What's on your mind today?**

**Need Focus?** I'll help you prioritize and stay on track
**Learning Something New?** Let's create a personalized roadmap
**Feeling Stuck?** I've got motivation and strategies ready
**Want to Plan?** I'll help you organize and schedule

**Just tell me what you're working towards, and let's turn your dreams into action!** ✨

What's your biggest goal right now? 🎯`,
  ]
  
  return greetings[Math.floor(Math.random() * greetings.length)]
}

function generateMotivationResponse(userText: string): string {
  const lowerText = userText.toLowerCase()
  
  if (lowerText.includes('overwhelm') || lowerText.includes('too much')) {
    return `🌊 **Feeling Overwhelmed? Let's Break It Down!**

Hey, I totally get it. Sometimes everything feels like too much at once. Let's tackle this together! 💙

## 🛟 **Immediate Relief Strategy:**

**1. Brain Dump (5 minutes)**
• Write down EVERYTHING on your mind
• Don't organize, just get it all out
• This alone reduces mental load by 40%!

**2. The Rule of 3**
• Pick only 3 things for today
• Everything else goes to "tomorrow" or "later"
• Focus creates calm

**3. Start Microscopic**  
• Choose the tiniest possible first step
• Just 2 minutes of action
• Motion creates momentum

## 💪 **Remember:**
• You don't have to do everything today
• Progress beats perfection, always
• You've overcome 100% of your tough days so far

**What's ONE small thing you could do right now?** Just one. Let's start there. 🌟`
  }
  
  return `🌟 **YOU'RE ABSOLUTELY INCREDIBLE!** 

I can feel your determination - that's the energy of someone destined for greatness! 💫

## 🔥 **Truth Bombs for Champions:**

**🎯 Every Expert Started as a Beginner**
• The only difference between you and your heroes? They kept going
• Your "failure" is just data for your success

**🚀 Small Actions = Big Results**
• 1% better each day = 37x better in a year
• Consistency beats intensity every time
• You're building something amazing, brick by brick

**✨ You're Already Winning**
• Seeking help shows wisdom, not weakness
• Planning ahead puts you in the top 5%
• Your future self is cheering you on right now!

## 💪 **Energy Boost Activated:**

What's one thing you're proud of accomplishing recently? Let's celebrate that momentum and use it to power your next move! 

**You've got this, champion!** 🏆✨`
}

function generateProductivityResponse(userText: string): string {
  return `🚀 **PRODUCTIVITY POWERHOUSE ACTIVATED!**

Ready to become unstoppable? Let's turn you into a productivity machine! ⚡

## 🎯 **The Ultimate Productivity Stack:**

### **🔥 Energy Management (Most Important!)**
• **Peak hours:** Tackle hardest tasks when energy is highest
• **Energy vampires:** Identify and eliminate what drains you  
• **Recovery rituals:** Schedule breaks like appointments

### **⏰ Time Mastery Techniques**
• **Time blocking:** Assign specific hours to specific tasks
• **Pomodoro Power:** 25 min focus + 5 min break cycles
• **Batch similar tasks:** Group emails, calls, admin work

### **🎪 Focus Enhancement**
• **Environment design:** Clear space = clear mind
• **Digital minimalism:** Close unnecessary tabs/apps
• **The 2-minute rule:** If it takes <2 min, do it now

### **📊 Progress Tracking**  
• Use the **Tasks tab** for daily organization
• Check **Analytics** to spot your patterns
• Celebrate small wins (they compound!)

## 🚀 **Quick Start Challenge:**
Choose your #1 priority task right now. Set a 25-minute timer. Go crush it! 

What's your biggest productivity blocker? Let's eliminate it together! 💪✨`
}

function generateLearningResponse(userText: string): string {
  return `🧠 **LEARNING ACCELERATOR ENGAGED!**

Ready to become a learning machine? You're in for an incredible journey! 🚀

## ✨ **The Science-Backed Learning Framework:**

### **📚 Active Learning Strategies**
• **Teach what you learn:** Explain concepts aloud or write them out
• **Practice recall:** Test yourself without looking at notes
• **Spaced repetition:** Review material at increasing intervals

### **🎯 Effective Study Methods**
• **The Feynman Technique:** Explain complex topics in simple terms
• **Interleaving:** Mix different types of problems/concepts
• **Elaborative interrogation:** Ask yourself "why" and "how"

### **🔄 Habit Formation**
• **Consistency > Intensity:** 30 min daily beats 5 hours once
• **Learning chains:** Link new knowledge to what you know
• **Environment cues:** Designate specific learning spaces

### **🗺️ Structured Approach**
Need a complete learning path? Just ask me to create a personalized roadmap!

**Example:** "Create a roadmap to learn Python in 3 months, 1 hour daily, I'm a beginner"

## 🚀 **Pro Learning Hacks:**
• Study before sleep (better retention)
• Use the Pomodoro technique for focus
• Join communities related to your topic
• Build projects, don't just consume content

What skill are you excited to master? Let's design your learning journey! 🌟📖`
}

function generateGoalPlanningResponse(userText: string): string {
  return `🎯 **GOAL ACHIEVEMENT SYSTEM ACTIVATED!**

Time to turn your dreams into your reality! Let's build an unstoppable plan! 💪

## 🏆 **The SMART-ER Goal Framework:**

### **📊 SMART Foundation**
• **S**pecific: Crystal clear what you want
• **M**easurable: Track progress with numbers  
• **A**chievable: Challenging but realistic
• **R**elevant: Aligned with your bigger vision
• **T**ime-bound: Clear deadline for urgency

### **🚀 ER Enhancement**  
• **E**valuate: Regular progress reviews
• **R**eadjust: Adapt based on what you learn

## 🛠️ **Goal Planning Toolkit:**

### **🔥 90-Day Sprint Method**
• Break big goals into 90-day chunks
• Focus creates momentum and results
• Regular review and adjustment cycles

### **📋 Daily Actions System**
• Identify 3 key daily actions
• Use the **Tasks tab** to track progress
• Celebrate daily wins (compound effect!)

### **🗺️ Milestone Mapping**
• Create checkpoints every 2-3 weeks
• Plan rewards for hitting milestones
• Use **Analytics** to track patterns

## 💡 **Goal Acceleration Secrets:**
• Write goals daily (increases success by 42%)
• Share with accountability partner
• Visualize success for 5 minutes daily
• Plan for obstacles before they happen

**What's your biggest goal right now?** Let's create an action plan that guarantees success! 🌟🎯`
}

function generateWellnessResponse(userText: string): string {
  return `🌿 **WELLNESS & BALANCE MODE ACTIVATED!**

Taking care of yourself isn't selfish—it's strategic! Let's optimize your well-being for peak performance! 💚

## 🧘 **The Balanced Achiever Framework:**

### **⚡ Energy Management**
• **Sleep optimization:** 7-9 hours, consistent schedule
• **Nutrition fuel:** Eat for sustained energy, not quick fixes
• **Movement medicine:** Even 10-minute walks boost creativity by 60%

### **🧠 Stress Mastery**
• **Breathing technique:** 4-7-8 method (inhale 4, hold 7, exhale 8)
• **Boundary setting:** Learn to say "no" to protect your "yes"
• **Mindfulness moments:** 5-minute meditation breaks

### **🎯 Work-Life Integration**
• **Transition rituals:** Clear start/stop work boundaries
• **Energy zones:** Match tasks to your natural rhythms
• **Recovery time:** Schedule downtime like important meetings

### **💪 Burnout Prevention**
• **Early warning signs:** Recognize fatigue, cynicism, reduced performance
• **Micro-recovery:** 2-minute breaks every hour
• **Passion projects:** Pursue activities that energize you

## 🌟 **Daily Wellness Stack:**
1. **Morning:** 5-minute stretch or meditation
2. **Work:** Pomodoro breaks with movement
3. **Evening:** Device-free wind-down routine

**Remember:** You can't pour from an empty cup. Self-care enables sustainable success!

What aspect of wellness needs your attention today? 🌱✨`
}

function generateCareerResponse(userText: string): string {
  return `🚀 **CAREER ACCELERATION HUB!**

Ready to level up your professional game? Let's build your career success story! 💼✨

## 🎯 **Strategic Career Development:**

### **📈 Skill Investment Strategy**
• **Future-proof skills:** AI literacy, emotional intelligence, adaptability
• **Industry research:** Stay ahead of trends in your field
• **Cross-functional knowledge:** Understand adjacent departments

### **🌐 Network Power Building**
• **Quality > Quantity:** Build genuine relationships
• **Value-first approach:** Help others before asking for help
• **Digital presence:** LinkedIn optimization and thought leadership

### **💡 Personal Brand Excellence**
• **Define your unique value:** What makes you irreplaceable?
• **Document achievements:** Quantify your impact with metrics
• **Storytelling mastery:** Craft compelling career narratives

### **🎪 Interview & Opportunity Prep**
• **STAR method:** Situation, Task, Action, Result stories ready
• **Questions prepared:** Research-based, thoughtful inquiries
• **Confidence building:** Practice and preparation reduce anxiety

## 🏆 **Career Acceleration Tactics:**
• **Skill roadmaps:** Ask me to create learning paths for career goals
• **Side projects:** Build portfolio pieces that showcase abilities
• **Mentorship:** Find guides who've walked your desired path
• **Continuous learning:** Industry certifications and courses

**What's your next career move?** Let's create a strategic plan to make it happen! 

*Try: "Create a roadmap to become a [role] in [timeframe]"* 🌟🚀`
}

function generateContextualResponse(userText: string, wordCount: number): string {
  if (wordCount > 20) {
    return `📝 **I hear you!** Thanks for sharing those details with me.

Based on what you've told me, I can help you with personalized strategies and actionable steps. 

## 🎯 **Here's how we can tackle this together:**

**📋 Break it down:** Let's turn this into manageable action items
**🗺️ Create a roadmap:** I can design a step-by-step plan  
**📊 Track progress:** Use our tools to monitor your journey
**💪 Stay motivated:** I'll keep you inspired and focused

**What's the most important thing you'd like to focus on first?** Let's start there and build momentum! 🚀✨`
  }
  
  return `👋 **Hey there!** I'm Sara, your AI productivity companion!

I'm here to help you achieve amazing things! ✨

## 🚀 **I specialize in:**

**🗺️ Learning Roadmaps** - Personalized step-by-step learning paths
**📋 Task Management** - Organization and productivity strategies  
**🎯 Goal Achievement** - Turn dreams into actionable plans
**💪 Motivation** - Keep you inspired and moving forward
**📊 Progress Tracking** - Monitor and celebrate your growth

## 💡 **Try asking me:**
• *"Create a roadmap to learn [skill] in [timeframe]"*
• *"Help me organize my daily tasks"*
• *"I need motivation to stay focused"*
• *"How can I be more productive?"*

**What would you like to work on today?** I'm here to help you succeed! 🌟

*P.S. The more specific you are, the better I can help you!* 😊`
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    if (!messages?.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    const reply = await querySimpleAI(lastMessage.content)
    
    return Response.json({ reply })
  } catch (error) {
    console.error("Chat error:", error)
    return Response.json(
      { error: "Failed to process chat" },
      { status: 500 }
    )
  }
}