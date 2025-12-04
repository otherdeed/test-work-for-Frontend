<template>
  <v-app>
    <header-component />

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12" md="8">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <h1 class="text-h4 mb-4">Мои задачи</h1>
                  
                  <div class="filter-section mb-4">
                    <v-btn 
                      @click="currentFilter = 'all'"
                      :class="{ 'bg-primary': currentFilter === 'all' }"
                      variant="tonal"
                      class="mr-2"
                    >
                      Все ({{ tasks.length }})
                    </v-btn>
                    <v-btn 
                      @click="currentFilter = 'active'"
                      :class="{ 'bg-primary': currentFilter === 'active' }"
                      variant="tonal"
                      class="mr-2"
                    >
                      Активные ({{ tasks.filter(t => !t.completed).length }})
                    </v-btn>
                    <v-btn 
                      @click="currentFilter = 'completed'"
                      :class="{ 'bg-primary': currentFilter === 'completed' }"
                      variant="tonal"
                      class="mr-2"
                    >
                      Завершенные ({{ tasks.filter(t => t.completed).length }})
                    </v-btn>
                  </div>

                  <v-form @submit.prevent="addTask" class="mb-6">
                    <v-text-field
                      v-model="newTaskTitle"
                      label="Новая задача"
                      :rules="[value => !!value || 'Введите текст задачи']"
                      variant="outlined"
                      density="comfortable"
                    />
                    <v-btn type="submit" color="primary" class="mt-2">Добавить</v-btn>
                  </v-form>

                  <v-list lines="two" class="elevation-1 rounded">
                    <v-list-item v-for="task in filteredTasks" :key="task.id">
                      <template v-slot:prepend>
                        <v-checkbox
                          :model-value="task.completed"
                          @update:model-value="toggleTask(task.id)"
                          density="comfortable"
                        />
                      </template>
                      
                      <v-list-item-title 
                        :class="{ 'text-decoration-line-through text-grey': task.completed }"
                        class="font-weight-medium"
                      >
                        {{ task.title }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        Создано: {{ formatDate(task.createdAt) }}
                        | Обновлено: {{ formatDate(task.updatedAt) }}
                        <span v-if="task.completed">
                          | Завершено: {{ formatTaskDate(task.completedAt) }}
                        </span>
                      </v-list-item-subtitle>
                      
                      <template v-slot:append>
                        <div v-if="pendingDeletions.has(task.id)" class="deletion-pending">
                          <v-chip color="error" size="small" class="mr-2">
                            Удаление через {{ deletionTimers[task.id]?.timeLeft || 10 }}
                          </v-chip>
                          <v-btn 
                            @click="cancelDeletion(task.id)"
                            variant="text"
                            color="warning"
                            size="small"
                          >
                            Отмена
                          </v-btn>
                        </div>
                        <v-btn 
                          v-else
                          icon 
                          @click="startDeletion(task.id)"
                          variant="text"
                          color="error"
                          size="small"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                    </v-list-item>
                  </v-list>

                  <v-card class="mt-6">
                    <v-card-text>
                      <p>Всего задач: {{ tasks.length }}</p>
                      <p>Активных: {{ tasks.filter(t => !t.completed).length }}</p>
                      <p>Завершенных: {{ tasks.filter(t => t.completed).length }}</p>
                      <p>Процент завершения: 
                        {{ (tasks.filter(t => t.completed).length / tasks.length * 100).toFixed(1) }}%
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface DeletionTimer {
  timerId: number
  timeLeft: number
}

const tasks = ref<any[]>([])
const userTasks = ref<any[]>([])
const newTaskTitle = ref('')
const currentFilter = ref<'all' | 'active' | 'completed'>('all')
const userFilter = ref<'all' | 'active'>('all')
const pendingDeletions = ref<Set<number>>(new Set())
const deletionTimers = ref<Record<number, DeletionTimer>>({})

const formatDate = (date: Date | null) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const getCompletionPercentage = () => {
  if (tasks.value.length === 0) return 0
  const completed = tasks.value.filter(t => t.completed).length
  return (completed / tasks.value.length * 100).toFixed(1)
}

const calculateCompletionRate = () => {
  if (userTasks.value.length === 0) return 0
  const completed = userTasks.value.filter(t => t.completed).length
  return (completed / userTasks.value.length * 100).toFixed(1)
}

const filteredTasks = computed(() => {
  switch (currentFilter.value) {
    case 'active':
      return tasks.value.filter(t => !t.completed)
    case 'completed':
      return tasks.value.filter(t => t.completed)
    default:
      return tasks.value
  }
})

const filteredUserTasks = computed(() => {
  if (userFilter.value === 'active') {
    return userTasks.value.filter(t => !t.completed)
  }
  return userTasks.value
})

const taskStats = computed(() => {
  console.log('Пересчет taskStats')
  const total = tasks.value.length
  const active = tasks.value.filter(t => !t.completed).length
  const completed = tasks.value.filter(t => t.completed).length
  const percentage = total > 0 ? (completed / total * 100).toFixed(1) : '0'
  return { total, active, completed, percentage }
})

const loadTasks = async () => {
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
}

const loadUserTasks = async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  userTasks.value = [
    {
      id: 101,
      title: 'Подготовить отчет',
      completed: true,
      createdAt: new Date('2024-02-01T10:00:00'),
      completedAt: new Date('2024-02-05T15:30:00')
    },
    {
      id: 102,
      title: 'Создать презентацию',
      completed: false,
      createdAt: new Date('2024-02-10T09:15:00'),
      completedAt: null
    },
    {
      id: 103,
      title: 'Провести митинг',
      completed: false,
      createdAt: new Date('2024-02-12T11:00:00'),
      completedAt: null
    },
    {
      id: 104,
      title: 'Код ревью',
      completed: true,
      createdAt: new Date('2024-02-08T14:20:00'),
      completedAt: new Date('2024-02-09T16:45:00')
    }
  ]
}

const formatTaskDate = (date: Date | null) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const addTask = () => {
  if (!newTaskTitle.value.trim()) return
  
  const newTask: any = {
    id: Date.now(),
    title: newTaskTitle.value,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null
  }
  
  tasks.value.push(newTask)
  newTaskTitle.value = ''
}

const toggleTask = (id: number) => {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    task.completed = !task.completed
    task.updatedAt = new Date()
    task.completedAt = task.completed ? new Date() : null
  }
}

const startDeletion = (id: number) => {
  pendingDeletions.value.add(id)
  
  const timerId = window.setInterval(() => {
    if (deletionTimers.value[id]) {
      deletionTimers.value[id].timeLeft--
      
      if (deletionTimers.value[id].timeLeft <= 0) {
        tasks.value = tasks.value.filter(t => t.id !== id)
        pendingDeletions.value.delete(id)
        
        const timer = deletionTimers.value[id]
        if (timer) {
          clearInterval(timer.timerId)
          delete deletionTimers.value[id]
        }
      }
    }
  }, 1000)
  
  deletionTimers.value[id] = {
    timerId,
    timeLeft: 10
  }
}

const cancelDeletion = (id: number) => {
  pendingDeletions.value.delete(id)
  
  const timer = deletionTimers.value[id]
  if (timer) {
    delete deletionTimers.value[id]
    
  }
}

const handleKeyPress = () => {
  console.log('Key pressed')
}

const handleResize = () => {
  console.log('Resize event')
}

window.addEventListener('keypress', handleKeyPress)
window.addEventListener('resize', handleResize)

onMounted(() => {
  loadTasks()
  loadUserTasks()
})
</script>

<style scoped>

.filter-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.deletion-pending {
  display: flex;
  align-items: center;
}

.text-decoration-line-through {
  text-decoration: line-through;
}

@media (max-width: 960px) {
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-section button {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>