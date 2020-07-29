<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>ลงทะเบียน</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-text-field
              label="ชื่อผู้ใช้งาน"
              name="username"
              v-model="inputData.username"
              prepend-icon="mdi-account"
              type="text"
            ></v-text-field>

            <v-text-field
              id="email"
              label="อีเมล"
              name="emailAddress"
              prepend-icon="mdi-email"
              type="text"
              v-model="inputData.emailAddress"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              v-if="inputData.username != '' && inputData.emailAddress != ''"
              color="primary"
              @click.native="register"
            >ลงทะเบียน</v-btn>
            <v-btn v-else disabled>ลงทะเบียน</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import * as defaults from "../defaults";
import {
  generateId,
  generateChallenge,
  ab2hex,
  decodeCredential,
  decodeAssertion,
} from "../helpers";

export default {
  name: "RegisterComponent",
  props: {
    callbackRegister: {
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
      savedCred: null,
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
    async register() {
      const publicKey = {
        rp: this.inputData.relyingParty,
        pubKeyCredParams: defaults.pubKeyCredParams,
        timeout: 60 * 1000,

        attestation: this.inputData.attestation,

        // This would allow restricting devices to e.g. touchid or u2f key but it doesn't work consistently at the moment (2019-01-20)
        authenticatorSelection:
          this.inputData.attachment === "any"
            ? undefined
            : {
                ...defaults.authenticatorSelection,
                authenticatorAttachment: this.inputData.attachment,
              },

        // cryptographic challenge from server
        challenge: generateChallenge(),

        // user details from server post account creation
        user: {
          id: generateId(),
          name: this.inputData.emailAddress,
          displayName: this.inputData.username,
        },
      };

      console.log({ publicKey });

      // register / create a new credential
      try {
        const cred = await navigator.credentials.create({ publicKey });
        this.savedCred = cred;
        this.userDetails = publicKey.user;
        console.log(`Credential obtained`, this.savedCred);
        const response = {
          savedCred: this.savedCred,
          userDetails: this.userDetails,
        };
        this.callbackRegister(response);
      } catch (e) {
        console.error(e.message);
      }
    },
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