'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { GraduationCap, Percent, Wallet, BookOpen, Check, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatINR } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  done: boolean;
}

export default function StudentHubPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [studentId, setStudentId] = useState('');
  
  // Budget State
  const [allowance, setAllowance] = useState(5000);
  const [expenses, setExpenses] = useState<{ id: string; name: string; amount: number }[]>([
    { id: '1', name: 'Textbooks', amount: 1500 },
    { id: '2', name: 'Hostel Rent', amount: 2000 },
  ]);
  const [newExpName, setNewExpName] = useState('');
  const [newExpAmt, setNewExpAmt] = useState('');

  // Study Planner State
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Compile Next.js 14 API Project', dueDate: '2026-05-20', done: false },
    { id: '2', title: 'Read Supplying Chains Business Model', dueDate: '2026-05-22', done: true },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  const handleVerify = () => {
    if (!studentId.trim()) {
      toast.error('Please input your valid Student Roll ID.');
      return;
    }
    setIsVerified(true);
    toast.success('Student status successfully verified! 35% discount has been applied to all premium plans!');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpName.trim() || !newExpAmt) return;
    setExpenses([
      ...expenses,
      { id: crypto.randomUUID(), name: newExpName.trim(), amount: Number(newExpAmt) },
    ]);
    setNewExpName('');
    setNewExpAmt('');
    toast.success('Budget expense logged!');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDate) return;
    setTasks([
      ...tasks,
      { id: crypto.randomUUID(), title: newTaskTitle.trim(), dueDate: newTaskDate, done: false },
    ]);
    setNewTaskTitle('');
    setNewTaskDate('');
    toast.success('Study assignment added!');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = allowance - totalSpent;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Student Hub
        </h1>
        <p className="text-xs text-zinc-500">
          Unlock discounted plans, maintain your personal productivity planners, and track study milestones.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Verification Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-cyan-400" />
                Student verification
              </CardTitle>
              <CardDescription className="text-xs">Submit roll credentials to apply for 35% discount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isVerified ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center space-y-2">
                  <Percent className="h-8 w-8 text-emerald-400 mx-auto animate-bounce" />
                  <h6 className="text-xs font-bold text-white">35% Discount Applied</h6>
                  <p className="text-[10px] text-zinc-400">
                    Your account has active student privileges. Premium plans will show discount pricing during billing.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-zinc-400">Institution Roll Number</label>
                    <Input
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. STU-2026-981"
                      className="bg-zinc-900 border-white/10 text-xs h-9"
                    />
                  </div>
                  <Button
                    onClick={handleVerify}
                    className="w-full bg-white text-black hover:bg-zinc-200 text-xs font-bold h-9 rounded-xl"
                  >
                    Verify Student Status
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Budget Tracker */}
          <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-violet-400" />
                Student Budget Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2 text-[11px]">
                <span className="text-zinc-500">Allowance:</span>
                <span className="text-white font-bold">{formatINR(allowance)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-[11px]">
                <span className="text-zinc-500">Spent:</span>
                <span className="text-red-400 font-bold">{formatINR(totalSpent)}</span>
              </div>
              <div className="flex justify-between pb-2 text-[11px]">
                <span className="text-zinc-500">Remaining:</span>
                <span className={`font-bold ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatINR(remainingBudget)}
                </span>
              </div>

              {/* Add Expense Form */}
              <form onSubmit={handleAddExpense} className="flex gap-1.5 pt-2">
                <Input
                  value={newExpName}
                  onChange={(e) => setNewExpName(e.target.value)}
                  placeholder="Item"
                  className="bg-zinc-900 border-white/5 text-[10px] h-8 flex-1"
                />
                <Input
                  type="number"
                  value={newExpAmt}
                  onChange={(e) => setNewExpAmt(e.target.value)}
                  placeholder="Amt"
                  className="bg-zinc-900 border-white/5 text-[10px] h-8 w-16"
                />
                <Button type="submit" className="bg-white text-black hover:bg-zinc-200 h-8 text-[10px] px-2.5">
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Study Planner Panel */}
        <div className="lg:col-span-2">
          <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl h-full">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-violet-400" />
                Study Planner & Assignments
              </CardTitle>
              <CardDescription className="text-xs">Organize your academic milestones and class projects</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="flex gap-2 text-xs">
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="New study assignment..."
                  className="bg-zinc-900 border-white/10 text-xs h-9 flex-1"
                />
                <Input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="bg-zinc-900 border-white/10 text-xs h-9 w-32"
                />
                <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold text-xs h-9 px-4 rounded-xl">
                  Add Task
                </Button>
              </form>

              {/* Tasks List */}
              <div className="space-y-2.5 pt-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-black/40 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition-colors ${
                          task.done 
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' 
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        {task.done && <Check className="h-3 w-3" />}
                      </button>
                      <span className={`font-medium ${task.done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-500">{task.dueDate}</span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
