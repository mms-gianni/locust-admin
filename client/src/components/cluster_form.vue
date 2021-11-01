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
          Start new Instance
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5">Instance</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Name*"
                  v-model="name"
                  :rules="nameRules"
                  required
                ></v-text-field>
              </v-col>

              <v-col
                cols="12"
              >
                <v-select
                  :items="locustfiles"
                  v-model="locustfile"
                  label="locustfile*"
                ></v-select>
              </v-col>

              <v-col
                cols="6"
              >
                <v-text-field
                  v-model="hostname"
                  hint="Hostname to access the Locust instance"
                  :rules="hostRules"
                  label="Hostname"
                ></v-text-field>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  v-model="workers"
                  hint="Number of worker nodes to start"
                  :rules="numberRules"
                  label="Workers"
                ></v-text-field>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  v-model="testHost"
                  hint="The Host you want run the test on"
                  :rules="urlRules"
                  label="Test Host"
                ></v-text-field>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  v-model="numUsers"
                  hint="Number of users"
                  :rules="numberRules"
                  label="Users"
                ></v-text-field>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  v-model="spawnRate"
                  hint="Spawn rate"
                  :rules="numberRules"
                  label="Spawn Rate"
                ></v-text-field>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  v-model="run_time"
                  hint="Seconds"
                  label="Run Time"
                ></v-text-field>
              </v-col>

              <v-col
                cols="6"
              >
                <v-checkbox
                  v-model="autostart"
                  label="Auto start"
                ></v-checkbox>
              </v-col>
              <v-col
                cols="6"
              >
                <v-checkbox
                  v-model="autodelete"
                  label="Auto delete"
                ></v-checkbox>
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
import axios from "axios";
export default {
    data: () => ({
      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length > 4) || 'Name must be more than 4 characters',
        v => /^[a-zA-Z0-9]+$/.test(v) || 'Name must be alphanumeric',
      ],
      hostRules: [
        v => (v && v.length > 4) || 'Name must be more than 4 characters',
        v => /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/.test(v) || 'Must be valid hostname',
      ],
      numberRules: [
        v => (v && v > 0) || 'Number must be more than 0',
      ],
      urlRules: [
        v => /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(v) || 'Must be valid URL'
      ],
      dialog: false,
      locustfiles: [],
      name: '',
      locustfile: '',
      hostname: '',
      workers: '1',
      testHost: 'https://',
      numUsers: '1',
      spawnRate: '1',
      run_time: '',
      autostart: false,
      autodelete: false,
    }),
    mounted() {
        this.getConfigList();
    },
    methods: {
        saveForm () {
          //console.log(this.name);
          //console.log(this.locustfile);
          axios.post(`/api/instance/${this.name}/${this.locustfile}/`, {
            locustfile: this.locustfile,
            hostname: this.hostname,
            workers: this.workers,
            testHost: this.testHost,
            numUsers: this.numUsers,
            spawnRate: this.spawnRate,
            run_time: this.run_time,
            autostart: this.autostart,
            autodelete: this.autodelete,
          }).then(response => {
            this.dialog = false;
            this.name = '';
            this.locustfile = '';
            this.hostname = '';
            this.workers = '1';
            this.testHost = 'https://';
            this.numUsers = '1';
            this.spawnRate = '1';
            this.run_time = '';
            this.autostart = false;
            this.autodelete = false;
            console.log(response);

            this.$parent.loadData();
          }).catch(error => {
            console.log(error);
          });
        },
        // get Config List for dropdown
        getConfigList() {
          new Promise(resolve => setTimeout(resolve, 1000)) // await 1 second to parent component to finish request
            .then(() => {
            axios.get('/api/locustfile')
                .then(response => {
                    let configslist = response.data.locustfiles.response.body.items;
                    configslist.forEach(element => {
                        //console.log(element.metadata.name);
                        this.locustfiles.push({
                            text: element.metadata.name,
                            value: element.metadata.name,
                        });
                    });
                    
                }
            )
            .catch((err) => {
                console.error(err);
            });
          });
          
        },
    },
}
</script>