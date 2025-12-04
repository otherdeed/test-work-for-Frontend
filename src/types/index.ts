export type Task = {
  completed: boolean
  id: number
  title: string
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type Activity = {
  id: number;
  action: 'added' | 'deleted' | 'completed' | 'uncompleted';
  taskId: number;
  taskTitle: string;
  timestamp: Date;
}