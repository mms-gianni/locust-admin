<template>
  <v-row justify="start">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          dark
          v-bind="attrs"
          v-on="on"
          class="mx-4"
        >
          Create new config
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5">Locustfile configuration</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Name*"
                  v-model="name"
                  required
                ></v-text-field>
              </v-col>

              <v-col
                cols="12"
              >
                <v-textarea
                  filled
                  name="input-7-4"
                  v-model="locustfile"
                  label="Locustfile.py*"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="saveForm()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>


<script>
import axios from 'axios';
export default {
    data: () => ({
      sheet: false,
      dialog: false,
      name: '',
      locustfile: '',
    }),
    methods: {
      saveForm () {
        console.log(this.name);
        console.log(this.locustfile);
        axios.post(`/api/config/ppp/${this.name}`, {
          name: this.name,
          content: this.locustfile,
        }).then(response => {
          this.dialog = false;
          this.name = '';
          this.locustfile = '';
          console.log(response);

          this.$parent.getConfigList();
        }).catch(error => {
          console.log(error);
        });
      },
    },
}
</script>