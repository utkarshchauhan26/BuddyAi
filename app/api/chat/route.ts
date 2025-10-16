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

// Enhanced AI system for roadmap generation and coaching
function generateIntelligentResponse(userText: string): string {
  const lowerText = userText.toLowerCase()
  
  // Roadmap generation - enhanced detection
  if (isRoadmapRequest(lowerText)) {
    return generateRoadmapResponse(userText)
  }
  
  // Roadmap import detection
  if (isImportedRoadmap(lowerText)) {
    return handleRoadmapImport(userText)
  }
  
  // Motivation and encouragement
  if (lowerText.includes('motivat') || lowerText.includes('encourag') || lowerText.includes('inspire')) {
    return `🌟 **YOU'RE ABSOLUTELY AMAZING!** 

I can see the dedication in your approach - just by asking for help, you're already ahead of most people! 💪

**Remember these truths:**
🎯 Every expert was once a beginner
🚀 Progress beats perfection every time
✨ Small consistent actions create extraordinary results
🏆 You're building something incredible, step by step

**You've got this!** The fact that you're here, planning and learning, shows you're already on the path to success. Keep going - your future self will thank you! 

What's one small step you can take right now? Let's celebrate that momentum! 🎉`
  }
  
  // Task and productivity help
  if (lowerText.includes('task') || lowerText.includes('productive') || lowerText.includes('focus')) {
    return `📋 **PRODUCTIVITY MODE ACTIVATED!**

Looking to crush your tasks? I'm here to help you become unstoppable! 💪

**Quick Wins:**
🎯 Break big tasks into 15-minute chunks
⏰ Try the Pomodoro technique (25min focus + 5min break)
📱 Use the Tasks tab to track everything
📊 Check Analytics to see your patterns

**Pro Tips:**
✅ Start with the hardest task when energy is high
🏆 Celebrate small wins - they add up!
🚫 Eliminate distractions for deep work
📈 Track your progress daily

Ready to get productive? Let's start with your most important task right now! 🚀`
  }
  
  // Learning and skill development
  if (lowerText.includes('learn') || lowerText.includes('skill') || lowerText.includes('study')) {
    return `🧠 **LEARNING ACCELERATOR ENGAGED!**

Ready to level up your skills? You're in the perfect place! ✨

**Smart Learning Strategy:**
📚 Set specific, measurable learning goals
🎯 Practice consistently > cramming occasionally  
🔄 Apply what you learn immediately
📝 Teach others to solidify understanding

**Need a structured approach?** 
Ask me to "create a roadmap to learn [skill] in [time], [level], [daily time]"

**Example:** "Create a roadmap to learn Python in 3 months, 2 hours daily, I'm a beginner"

What skill are you excited to master? Let's build your learning path! 🚀`
  }
  
  // Goal setting and planning
  if (lowerText.includes('goal') || lowerText.includes('plan') || lowerText.includes('achieve')) {
    return `🎯 **GOAL CRUSHER MODE ACTIVATED!**

I love your ambition! Let's turn those dreams into actionable plans! 💪

**SMART Goal Framework:**
📊 **Specific** - What exactly do you want?
📏 **Measurable** - How will you track progress?
🎯 **Achievable** - Is it realistic with your resources?
📈 **Relevant** - Does it align with your bigger vision?
⏰ **Time-bound** - When will you complete it?

**My Tools for Success:**
🗺️ Create detailed roadmaps
📋 Break goals into daily tasks
📊 Track progress with analytics
🏆 Celebrate milestones

What's your big goal? Share it and I'll help you create a winning strategy! 🚀`
  }
  
  // Default helpful AI response
  return `Hey there! 👋 I'm Sara, your AI productivity companion, and I'm excited to help you succeed! ✨

**I can help you with:**
🗺️ **Roadmaps** - Create personalized learning paths
📋 **Tasks** - Organize and track your work  
📊 **Analytics** - Understand your productivity patterns
🎯 **Goals** - Plan and achieve your dreams
💪 **Motivation** - Keep you inspired and focused

**Quick Start Ideas:**
• "Create a roadmap to learn [skill]"
• "Help me plan my day"
• "I need some motivation"
• "How can I be more productive?"

What would you like to tackle first? I'm here to make it happen! 🚀`
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