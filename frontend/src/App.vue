<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const tasks = ref([]);
const editing = ref(false);

onMounted(async () => {
  // Dohvati token iz localStorage
  let token = localStorage.getItem("token");
  if (!token) {
    alert("Nisi prijavljen. Jbg");
    //window.location.href = "/login"; // Prilagodite URL prema vašem routeru
    return;
  }

  try {
    const response = await axios.get("http://localhost:8000/tasks", {
      headers: {
        Authorization: token, // Šalje token iz localStorage
      },
    });
    tasks.value = response.data;
    console.log("Dohvaćeno:", response.data);
  } catch (error) {
    console.error("Error u dohvaćanju:", error);
  }
});

function dodajZadatak(task) {
  tasks.value.unshift(task);
  editing.value = false;

  fetchTasks();
}

async function fetchTasks() {
  try {
    const response = await axios.get("http://localhost:8000/tasks");
    tasks.value = response.data;
    console.log("Tasks refreshed:", response.data);
  } catch (error) {
    console.error("Error u dohvaćanju:", error);
  }
}

async function markAsCompleted(taskId) {
  try {
    await axios.patch(`http://localhost:8000/tasks/${taskId}`);

    const task = tasks.value.find((task) => task._id === taskId);
    if (task) {
      task.zavrsen = true;
    }
  } catch (error) {
    console.error("Error u označavanju:", error);
    alert("Nismo ga označili.");
  }
}

async function deleteTask(taskId) {
  const isConfirmed = window.confirm("Si siguran da ga želiš zbrisat?");

  if (isConfirmed) {
    try {
      await axios.delete(`http://localhost:8000/tasks/${taskId}`);

      tasks.value = tasks.value.filter((task) => task._id !== taskId);
    } catch (error) {
      console.error("Error u brisanju:", error);
      alert("Nismo ga obrisali.");
    }
  }
}
</script>

<template>
  <router-view />
</template>
