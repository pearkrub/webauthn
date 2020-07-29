<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>เข้าสู่ระบบ</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-text-field
              label="ชื่อผู้ใช้งาน"
              name="username"
              v-model="inputData.username"
              prepend-icon="mdi-account"
              type="text"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              v-if="inputData.username != ''"
              color="primary"
              @click.native="authenticate"
            >เข้าสู่ระบบ</v-btn>
            <v-btn v-else disabled>เข้าสู่ระบบ</v-btn>
            <v-btn color="success" @click.native="returnToRegister">ลงทะเบียน</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import * as defaults from "../defaults";
import {
  generateChallenge,
  ab2hex,
  decodeCredential,
  decodeAssertion,
} from "../helpers";

export default {
  name: "LoginComponent",
  props: {
    returnToRegister: {
      type: Function,
      default: () => {},
    },
    savedCred: {
      type: Object,
      default: null,
    },
    callbackLogin: {
      type: Function,
      default: () => {},
    },
  },
  components: {},
  data() {
    return {
      inputData: {
        username: "",
        emailAddress: "",
        relyingParty: {
          name: "Falcon Transportation Services",
          id: "fwd-line-app.web.app",
        },
        attachment: "platform",
        attestation: "none",
      },
      userDetails: null,
      assertion: null,
      checkAuthenticatorAvailable: false,
    };
  },
  computed: {
    formattedUserDetails() {
      if (!this.userDetails) return null;
      return {
        ...this.userDetails,
        id: ab2hex(this.userDetails.id),
      };
    },
    formattedSavedCred() {
      if (!this.savedCred) return null;
      return decodeCredential(this.savedCred);
    },
    formattedAssertion() {
      if (!this.assertion) return null;
      return decodeAssertion(this.assertion);
    },
  },
  methods: {
    async authenticate() {
      if (!this.savedCred) {
        alert("You must register first");
        return;
      }

      const publicKey = {
        rp: this.inputData.relyingParty,
        pubKeyCredParams: defaults.pubKeyCredParams,
        attestation: defaults.attestation,
        timeout: 60 * 1000,

        // cryptographic challenge from server
        challenge: generateChallenge(),

        allowCredentials: [
          {
            // user's credential id and settings from server
            id: this.savedCred.rawId,
            // transports: defaults.transports,
            type: defaults.credentialType,
          },
        ],
      };

      console.log({ publicKey });

      try {
        const assertion = await navigator.credentials.get({ publicKey });
        console.log(`Assertion obtained`, assertion);
        this.assertion = assertion;
        this.callbackLogin({
          assertion: assertion,
          username: this.inputData.username,
        });
      } catch (e) {
        console.error(e.message);
      }
    },
  },
  async mounted() {
    this.checkAuthenticatorAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    // console.log(this.checkAuthenticatorAvailable); // true or false
    //
  },
};
</script>