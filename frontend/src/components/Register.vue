<template>
    <div class="register">
      <h2>Register</h2>
      <form @submit.prevent="register">
        <div>
          <label for="username">Username:</label>
          <input
            type="text"
            id="username"
            v-model="formData.username"
            required
          />
        </div>
        <div>
          <label for="password">Password:</label>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <p v-if="message" :class="{ success: isSuccess, error: !isSuccess }">
        {{ message }}
      </p>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        formData: {
          username: "",
          password: "",
        },
        message: "",
        isSuccess: false,
      };
    },
    methods: {
      async register() {
        try {
          const response = await axios.post(
            "http://localhost:8000/auth/register",
            this.formData
          );
          this.message = response.data.message;
          this.isSuccess = true;
          this.$router.push("/login");
        } catch (error) {
          this.message =
            error.response?.data?.message || "An error occurred during registration.";
          this.isSuccess = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .register {
    width: 300px;
    margin: 20px auto;
  }
  label {
    display: block;
    margin-bottom: 5px;
  }
  input {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
  }
  button {
    width: 100%;
    padding: 10px;
    background-color: #4caf50;
    color: white;
    border: none;
    cursor: pointer;
  }
  button:hover {
    background-color: #45a049;
  }
  .success {
    color: green;
  }
  .error {
    color: red;
  }
  </style>
  