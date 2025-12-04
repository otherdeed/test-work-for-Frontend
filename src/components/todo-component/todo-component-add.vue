<template>
  <v-form @submit.prevent="addNewTask(newTaskTitle)" class="mb-6">
    <v-text-field
      v-model="newTaskTitle"
      label="Новая задача"
      :rules="[value => !!value || 'Введите текст задачи']"
      variant="outlined"
      density="comfortable"
    />
    <v-btn type="submit" color="primary" class="mt-2">Добавить</v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { useTasksStore } from '@/store/tasks'
import { ref } from 'vue'

const tasksStore = useTasksStore()
const { addTask } = tasksStore

const newTaskTitle = ref('')

function addNewTask(title: string) {
    addTask(title.trim())
    newTaskTitle.value = ''
}

</script>