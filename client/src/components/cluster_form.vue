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
          Start new Cluster Instance
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
                  label="Hostname"
                ></v-text-field>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  v-model="workers"
                  hint="Number of worker nodes to start"
                  label="Workers"
                ></v-text-field>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  v-model="testHost"
                  hint="The Host you want run the test on"
                  label="Test Host"
                ></v-text-field>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  v-model="numUsers"
                  hint="Number of users"
                  label="Users"
                ></v-text-field>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  v-model="spawnRate"
                  hint="Spawn rate"
                  label="Spawn Rate"
                ></v-text-field>
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
      dialog: false,
      locustfiles: [],
      name: '',
      locustfile: '',
      hostname: '',
      workers: '1',
      testHost: 'https://',
      numUsers: '1',
      spawnRate: '1',
    }),
    mounted() {
        this.getConfigList();
    },
    methods: {
        saveForm () {
          console.log(this.name);
          console.log(this.locustfile);
          axios.post(`/api/cluster/ppp/${this.name}/${this.locustfile}/`, {
            locustfile: this.locustfile,
            hostname: this.hostname,
            workers: this.workers,
            testHost: this.testHost,
            numUsers: this.numUsers,
            spawnRate: this.spawnRate,
          }).then(response => {
            this.dialog = false;
            this.name = '';
            this.locustfile = '';
            this.hostname = '';
            this.workers = '1';
            this.testHost = 'https://';
            this.numUsers = '1';
            this.spawnRate = '1';
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
            axios.get('/api/config/ppp')
                .then(response => {
                    let configslist = response.data.locustfiles.response.body.items;
                    configslist.forEach(element => {
                        console.log(element.metadata.name);
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