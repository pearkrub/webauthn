<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn href="#" text>
        <span class="mr-2">Web Authen Demo</span>
      </v-btn>
    </v-app-bar>

    <v-main v-if="!isLogin">
      <div v-if="!checkAuthenticatorAvailable">
        <v-alert dense outlined type="error">browser ของคุณไม่รองรับ Login Touch ID</v-alert>
      </div>
      <div v-if="isLoginFail">
        <v-alert dense outlined type="error">ข้อมูลผู้ใช้งานไม่ถูกต้อง</v-alert>
      </div>
      <v-alert v-if="registerData" type="success" text>ลงทะเบียนสำเร็จ</v-alert>
      <RegisterComponent v-if="page == 'register'" :callback-register="callbackRegister" />
      <LoginComponent
        v-else
        :callback-login="callbackLogin"
        :return-to-register="returnToRegister"
        :saved-cred="registerData.savedCred"
      />
    </v-main>
    <v-main v-else>
      <br />
      <v-alert v-if="registerData" type="success" text>
        Welcame:
        <strong>{{ registerData.userDetails.displayName }}</strong>
      </v-alert>
    </v-main>
  </v-app>
</template>

<script>
// import HelloWorld from "./components/HelloWorld";
import RegisterComponent from "./components/RegisterComponent";
import LoginComponent from "./components/LoginComponent";

export default {
  name: "App",
  components: {
    RegisterComponent,
    LoginComponent,
  },

  data: () => ({
    page: "register",
    registerData: null,
    loginData: null,
    isLogin: false,
    checkAuthenticatorAvailable: true,
    isLoginFail: false,
  }),
  methods: {
    callbackRegister(response) {
      console.log("registerData", response);
      this.registerData = response;
      this.page = "login";
    },
    callbackLogin(response) {
      console.log("loginData", response);
      this.loginData = response.assertion;
      if (
        this.loginData.id == this.registerData.savedCred.id &&
        response.username == this.registerData.userDetails.displayName
      ) {
        this.isLogin = true;
        this.isLoginFail = false;
      } else {
        this.isLoginFail = true;
        this.isLogin = false;
      }
    },
    returnToRegister() {
      this.page = "register";
    },
  },
  async mounted() {
    try {
      this.checkAuthenticatorAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      console.log(this.checkAuthenticatorAvailable);
    } catch (error) {
      console.log(error);
      this.checkAuthenticatorAvailable = false;
    }
  },
};
</script>
<style>
.output {
  width: 800px;
  display: inline-block;
  text-align: left;
  background: #eee;
  overflow-x: scroll;
}
.container.fill-height {
  display: flow-root;
}
</style>