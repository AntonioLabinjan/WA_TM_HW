<template>
    <div class="login">
      <h2>Login</h2>
      <form @submit.prevent="login">
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
        <button type="submit">Login</button>
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
      async login() {
        try {
          const response = await axios.post(
            "http://localhost:8000/auth/login",
            this.formData
          );
          const { jwt_token } = response.data;
          this.message = "Login successful!";
          this.isSuccess = true;
  
          // Store JWT in localStorage
          localStorage.setItem("jwt_token", jwt_token);
          this.$router.push("/home");
        } catch (error) {
          this.message =
            error.response?.data || "An error occurred during login.";
          this.isSuccess = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .login {
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
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
  .success {
    color: green;
  }
  .error {
    color: red;
  }
  </style>
  