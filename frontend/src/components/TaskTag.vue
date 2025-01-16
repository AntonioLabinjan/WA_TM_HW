<template>
    <span :class="tagMapping[tag]">{{ tag }}</span>
  </template>
  
  <script setup>
  defineProps({
    tag: Object,
    //className: String, 
  });

  let tagMapping = {
    "hitno": "bg-red-500 text-white",
    "faks": "bg-blue-500 text-white",
    "pomalo": "bg-green-500 text-white"
  }
  </script>
  
  <style scoped>
  .tag {
    padding: 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    display: inline-block;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
  }
  </style>
  