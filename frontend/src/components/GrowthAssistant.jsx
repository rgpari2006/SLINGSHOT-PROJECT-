import { useState } from 'react'

const cannedResponses = [
  { trigger: 'drop', answer: 'Sales may drop next month. Consider retention campaigns and offers.' },
  { trigger: 'marketing', answer: 'Increase marketing budget for high-converting channels by 8-12%.' },
  { trigger: 'burn', answer: 'Burn rate is manageable, but trim low ROI tooling to improve runway.' }
]

export default function GrowthAssistant() {
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: 'Hi! I am your AI Growth Assistant. Ask me about sales, marketing, or burn rate.' }
  ])
  const [input, setInput] = useState('')

  const getResponse = (question) => {
    const lower = question.toLowerCase()
    const matched = cannedResponses.find((item) => lower.includes(item.trigger))
    if (matched) return matched.answer
    return 'Growth signal: maintain weekly funnel experiments and monitor CAC-to-LTV ratio closely.'
  }

  const onSend = () => {
    if (!input.trim()) return

    const userMessage = { sender: 'user', text: input }
    const botMessage = { sender: 'assistant', text: getResponse(input) }
    setMessages((prev) => [...prev, userMessage, botMessage])
    setInput('')
  }

  return (
    <div className="card assistant-card">
      <h3>AI Growth Assistant</h3>
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for startup growth advice..."
        />
        <button onClick={onSend}>Send</button>
      </div>
    </div>
  )
}
