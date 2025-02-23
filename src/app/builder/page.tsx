"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Pause,
  Send,
  X,
  Play,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  PenToolIcon as Tool,
  Bot,
  MessageSquare,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface VoiceAgentBuilderProps {
  onClose: () => void;
  initialDescription: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Tool {
  name: string;
  description: string;
  parameters: string;
}

interface AgentConfig {
  name: string;
  description: string;
  knowledgeBase: string[];
  systemPrompt: string;
  tools: Tool[];
  voiceConfig: {
    type: string;
    speed: number;
    style: string;
  };
  welcomeMessage: string;
  fallbackMessage: string;
}

export default function Page({
  onClose,
  initialDescription,
}: VoiceAgentBuilderProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I've created an initial configuration for your Voice AI Agent based on your input. Let's review and refine it together. We'll start with the agent's name and description. Does this look good to you?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: "AI Customer Service Agent",
    description:
      initialDescription ||
      "A helpful assistant that handles customer inquiries and support requests",
    knowledgeBase: ["https://example.com/customer-service-handbook"],
    systemPrompt:
      "You are a friendly and efficient customer service AI assistant.",
    tools: [
      {
        name: "Check Order Status",
        description: "Retrieves the current status of a customer order",
        parameters: '{"orderId": "string"}',
      },
    ],
    voiceConfig: {
      type: "Professional Female",
      speed: 1,
      style: "Friendly and Helpful",
    },
    welcomeMessage: "Hello! How can I assist you today?",
    fallbackMessage:
      "I'm sorry, I didn't quite understand that. Could you please rephrase your question?",
  });
  const [isTestMode, setIsTestMode] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState("");
  const [newTool, setNewTool] = useState<Tool>({
    name: "",
    description: "",
    parameters: "",
  });
  const [testMessages, setTestMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(50);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const testChatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = event.results[event.resultIndex][0].transcript;
        setInputMessage((prev) => prev + " " + transcript);
      };
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (testChatContainerRef.current) {
      testChatContainerRef.current.scrollTop =
        testChatContainerRef.current.scrollHeight;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessages = [...messages, { role: "user", content: inputMessage }];
    setMessages(newMessages);
    setInputMessage("");

    // Simulate AI response and form updates
    setTimeout(() => {
      const response =
        "I've updated the configuration based on your input. Is there anything else you'd like to modify?";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    }, 1000);
  };

  const handleTestMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessages = [
      ...testMessages,
      { role: "user", content: inputMessage },
    ];
    setTestMessages(newMessages);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const response =
        "This is a simulated response from your AI agent. In a real implementation, this would be generated based on your agent's configuration and knowledge base.";
      setTestMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
      speakMessage(response);
    }, 1000);
  };

  const speakMessage = (message: string) => {
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.volume = volume / 100;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isTestMode) {
        handleTestMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  const addKnowledgeBase = () => {
    if (newKnowledge.trim()) {
      setAgentConfig((prev) => ({
        ...prev,
        knowledgeBase: [...prev.knowledgeBase, newKnowledge],
      }));
      setNewKnowledge("");
    }
  };

  const removeKnowledgeBase = (index: number) => {
    setAgentConfig((prev) => ({
      ...prev,
      knowledgeBase: prev.knowledgeBase.filter((_, i) => i !== index),
    }));
  };

  const addTool = () => {
    if (newTool.name && newTool.description) {
      setAgentConfig((prev) => ({
        ...prev,
        tools: [...prev.tools, newTool],
      }));
      setNewTool({ name: "", description: "", parameters: "" });
    }
  };

  const removeTool = (index: number) => {
    setAgentConfig((prev) => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index),
    }));
  };

  const startTestMode = () => {
    setIsTestMode(true);
    setTestMessages([
      { role: "assistant", content: agentConfig.welcomeMessage },
    ]);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-sky-900 to-black text-white">
      <div className="h-full flex">
        {!isTestMode ? (
          <>
            {/* Left Panel - Form */}
            <div className="w-1/2 p-6 overflow-y-auto border-r border-white/10">
              <div className="max-w-md mx-auto space-y-8">
                <div className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-sky-400" />
                  <h2 className="text-2xl font-bold">Agent Configuration</h2>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sky-400">
                    Basic Information
                  </h3>
                  <div>
                    <Label htmlFor="name">Agent Name</Label>
                    <Input
                      id="name"
                      value={agentConfig.name}
                      onChange={(e) =>
                        setAgentConfig((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="mt-1 bg-white/5 border-white/10"
                      placeholder="Enter agent name..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={agentConfig.description}
                      onChange={(e) =>
                        setAgentConfig((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="mt-1 bg-white/5 border-white/10"
                      placeholder="Describe your agent's purpose..."
                    />
                  </div>
                </div>

                {/* Knowledge Base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sky-400 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Knowledge Base
                  </h3>
                  <div className="space-y-2">
                    {agentConfig.knowledgeBase.map((knowledge, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 bg-white/5 p-2 rounded-lg"
                      >
                        <div className="flex-1 text-sm">{knowledge}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeKnowledgeBase(index)}
                          className="h-8 w-8 text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        value={newKnowledge}
                        onChange={(e) => setNewKnowledge(e.target.value)}
                        placeholder="Add documentation URL or paste text..."
                        className="bg-white/5 border-white/10"
                      />
                      <Button
                        onClick={addKnowledgeBase}
                        disabled={!newKnowledge.trim()}
                        size="icon"
                        className="bg-sky-500 hover:bg-sky-600"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tools */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sky-400 flex items-center gap-2">
                    <Tool className="w-5 h-5" />
                    Available Tools
                  </h3>
                  <div className="space-y-4">
                    {agentConfig.tools.map((tool, index) => (
                      <div
                        key={index}
                        className="bg-white/5 p-3 rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="font-medium">{tool.name}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTool(index)}
                            className="h-8 w-8 text-red-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-400">
                          {tool.description}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {tool.parameters}
                        </div>
                      </div>
                    ))}
                    <Card className="bg-white/5 border-white/10">
                      <div className="p-3 space-y-3">
                        <Input
                          value={newTool.name}
                          onChange={(e) =>
                            setNewTool((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Tool name..."
                          className="bg-white/5 border-white/10"
                        />
                        <Textarea
                          value={newTool.description}
                          onChange={(e) =>
                            setNewTool((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Tool description..."
                          className="bg-white/5 border-white/10"
                        />
                        <Textarea
                          value={newTool.parameters}
                          onChange={(e) =>
                            setNewTool((prev) => ({
                              ...prev,
                              parameters: e.target.value,
                            }))
                          }
                          placeholder="Parameters (JSON)..."
                          className="bg-white/5 border-white/10 font-mono text-sm"
                        />
                        <Button
                          onClick={addTool}
                          disabled={!newTool.name || !newTool.description}
                          className="w-full bg-sky-500 hover:bg-sky-600"
                        >
                          Add Tool
                          <Plus className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Voice Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sky-400 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Voice Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="voiceType">Voice Type</Label>
                      <Input
                        id="voiceType"
                        value={agentConfig.voiceConfig.type}
                        onChange={(e) =>
                          setAgentConfig((prev) => ({
                            ...prev,
                            voiceConfig: {
                              ...prev.voiceConfig,
                              type: e.target.value,
                            },
                          }))
                        }
                        className="mt-1 bg-white/5 border-white/10"
                        placeholder="e.g., Professional Female, Friendly Male..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="voiceStyle">Speaking Style</Label>
                      <Input
                        id="voiceStyle"
                        value={agentConfig.voiceConfig.style}
                        onChange={(e) =>
                          setAgentConfig((prev) => ({
                            ...prev,
                            voiceConfig: {
                              ...prev.voiceConfig,
                              style: e.target.value,
                            },
                          }))
                        }
                        className="mt-1 bg-white/5 border-white/10"
                        placeholder="e.g., Conversational, Professional..."
                      />
                    </div>
                  </div>
                </div>

                {/* Test Button */}
                <Button
                  className="w-full bg-sky-500 hover:bg-sky-600"
                  onClick={startTestMode}
                >
                  Test Your Agent
                  <Play className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right Panel - Chat */}
            <div className="w-1/2 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  <h2 className="text-xl font-bold">AI Assistant</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-4 mb-4"
              >
                {messages.map((message, index) => (
                  <Card
                    key={index}
                    className={`p-4 max-w-[80%] ${
                      message.role === "assistant"
                        ? "bg-sky-900/50 border-sky-500/20 ml-0 text-white"
                        : "bg-sky-500 ml-auto text-white"
                    }`}
                  >
                    {message.content}
                  </Card>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex items-end gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[80px] max-h-[160px] bg-white/5 border-white/10"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    size="icon"
                    className={`rounded-full ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-sky-500 hover:bg-sky-600"
                    }`}
                    onClick={toggleListening}
                  >
                    {isListening ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    className="rounded-full bg-sky-500 hover:bg-sky-600"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Test Mode UI
          <div className="w-full p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-sky-400" />
                <h2 className="text-xl font-bold">Test Your Voice AI Agent</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsTestMode(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Test Chat Messages */}
            <div
              ref={testChatContainerRef}
              className="flex-1 overflow-y-auto space-y-4 mb-4"
            >
              {testMessages.map((message, index) => (
                <Card
                  key={index}
                  className={`p-4 max-w-[80%] ${
                    message.role === "assistant"
                      ? "bg-sky-900/50 border-sky-500/20 ml-0 text-white"
                      : "bg-sky-500 ml-auto text-white"
                  }`}
                >
                  {message.content}
                </Card>
              ))}
            </div>

            {/* Test Input Area */}
            <div className="flex items-end gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 min-h-[80px] max-h-[160px] bg-white/5 border-white/10"
              />
              <div className="flex flex-col gap-2">
                <Button
                  size="icon"
                  className={`rounded-full ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-sky-500 hover:bg-sky-600"
                  }`}
                  onClick={toggleListening}
                >
                  {isListening ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  className="rounded-full bg-sky-500 hover:bg-sky-600"
                  onClick={handleTestMessage}
                  disabled={!inputMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="mt-4 flex items-center gap-2">
              {volume === 0 ? (
                <VolumeX className="h-5 w-5 text-sky-400" />
              ) : (
                <Volume2 className="h-5 w-5 text-sky-400" />
              )}
              <Slider
                value={[volume]}
                onValueChange={(values) => setVolume(values[0])}
                max={100}
                step={1}
                className="w-[200px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
