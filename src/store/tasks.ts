import type { Activity, Task } from "@/types"
import { truncateTitle } from "@/utils/truncateTitle"
import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"

const STORAGE_KEY_TASKS = 'tasks-data'
const STORAGE_KEY_ACTIVITIES = 'tasks-activities'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>(loadFromStorage<Task[]>(STORAGE_KEY_TASKS) || [])
  const activities = ref<Activity[]>(loadFromStorage<Activity[]>(STORAGE_KEY_ACTIVITIES) || [])

  function loadFromStorage<T>(key: string): T | null {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          return parsed.map(item => {
            if (item.createdAt) item.createdAt = new Date(item.createdAt)
            if (item.updatedAt) item.updatedAt = new Date(item.updatedAt)
            if (item.completedAt) item.completedAt = new Date(item.completedAt)
            if (item.timestamp) item.timestamp = new Date(item.timestamp)
            return item
          }) as T
        }
        return parsed
      } catch (e) {
        console.error('Error parsing storage data:', e)
        return null
      }
    }
    return null
  }

  function saveToStorage(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.error('Error saving to storage:', e)
    }
  }

  watch(tasks, (newTasks) => {
    saveToStorage(STORAGE_KEY_TASKS, newTasks)
  }, { deep: true })

  watch(activities, (newActivities) => {
    saveToStorage(STORAGE_KEY_ACTIVITIES, newActivities)
  }, { deep: true })

  async function fetchTasks() {
    if (tasks.value.length > 0) {
      return
    }

    await new Promise(resolve => setTimeout(resolve, 300))
    tasks.value = [
      {
        id: 1,
        title: 'Изучить Vue 3 Composition API',
        completed: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        completedAt: new Date('2024-01-20')
      },
      {
        id: 2,
        title: 'Написать тестовое задание',
        completed: false,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        completedAt: null
      },
      {
        id: 3,
        title: 'Рефакторинг legacy кода',
        completed: false,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        completedAt: null
      },
      {
        id: 4,
        title: 'Изучить Pinia и лучшие практики',
        completed: true,
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-30'),
        completedAt: new Date('2024-01-30')
      }
    ]
    
    if (activities.value.length === 0) {
      tasks.value.forEach(task => {
        addActivity('added', task.id, task.title)
      })
    }
  }

  const tasksSortedByCreatedAt = computed(() => {
    return [...tasks.value].sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  })

  const activitiesSorted = computed(() => {
    return [...activities.value].sort((a, b) => {
      return b.timestamp.getTime() - a.timestamp.getTime()
    })
  })

  function addActivity(action: Activity['action'], taskId: number, taskTitle: string) {
    const activity: Activity = {
      id: Date.now(),
      action,
      taskId,
      taskTitle: truncateTitle(taskTitle, 20),
      timestamp: new Date()
    }
    activities.value.push(activity)
  }

  async function addTask(title: string) {
    const newTask: Task = {
      id: Date.now(),
      title,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null
    }
    tasks.value.push(newTask)
    addActivity('added', newTask.id, title)
  }

  function deleteTask(id: number) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      addActivity('deleted', id, task.title)
      tasks.value = tasks.value.filter(t => t.id !== id)
    }
  }

  function toggleTaskCompletion(id: number) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.completed = !task.completed
      task.updatedAt = new Date()
      task.completedAt = task.completed ? new Date() : null

      addActivity(
        task.completed ? 'completed' : 'uncompleted',
        id,
        task.title
      )
    }
  }
  
  return {
    // state
    tasks,
    tasksSortedByCreatedAt,
    activitiesSorted,
    activities,

    // actions
    fetchTasks,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    addActivity
  }
})