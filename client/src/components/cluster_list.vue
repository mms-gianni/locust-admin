<template>
    <v-container :fluid="true">
        <v-layout row wrap>
            <v-flex xs12 md12>

                <v-data-table
                    :headers="headers"
                    :items="instances"
                    :items-per-page="15"
                    class="elevation-0"
                >
                <template v-slot:item="row">
                    <tr>
                        <td><a :href=row.item.ingressHost>{{row.item.name}}</a></td>
                        <td>{{row.item.namespace}}</td>
                        <td>{{row.item.creationTimestamp}}</td>
                        <td>{{row.item.numUsers}}</td>
                        <td>{{row.item.spawnRate}}</td>
                        <td>{{row.item.worker}}</td>
                        <td>
                            <v-btn
                                color="red darken-4"
                                class="mx-2"
                                fab dark x-small
                                elevation="2"
                                 @click="removeInstance(row.item)"
                                >
                                <v-icon dark>mdi-delete</v-icon>
                            </v-btn>
                            <!--
                            <v-btn
                                color="primary"
                                class="mx-2"
                                fab dark x-small
                                elevation="2"
                                 @click="onButtonClick(row.item)"
                                >
                                <v-icon dark>mdi-pencil</v-icon>
                            </v-btn>
                            <v-btn
                                color="success"
                                class="mx-2"
                                fab dark x-small
                                elevation="2"
                                 @click="runLoadtest(row.item)"
                                >
                                <v-icon dark>mdi-play</v-icon>
                            </v-btn>
                            -->
                        </td>
                    </tr>
                </template>
                </v-data-table>

                <Form></Form>

            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import axios from "axios";
import Form from "./cluster_form.vue";
export default {
    sockets: {
        updatedStatus(instances) {
            /*
            //this.instances = locust.instances;
            this.instances = this.instances.map(instance => {
                if (instance.name === locust.name) {
                    instance.status = locust.status;
                }
                return instance;
            });
            */
            let instancesList = [];
            for (let instance in instances) {
                instancesList.push(instances[instance]);
            }
            this.instances = instancesList;
        },
    },
    mounted() {
        this.loadData();
    },
    data: () => ({
      sheet: false,
      headers: [
        {
            text: 'Instance Name',
            align: 'start',
            sortable: false,
            value: 'name',
        },
        { text: 'Namespace', value: 'namespace' },
        { text: 'Creation Timestamp', value: 'creationTimestamp' },
        { text: 'Parallel Users', value: 'numUsers' },
        { text: 'Spawn Rate', value: 'spawnRate' },
        { text: 'Worker', value: 'worker' },
        {   
            text: '', 
            value: 'toolbox',
            align: 'end',
            sortable: false,
        },
      ],
      instances: [],
      locustfiles: [],
    }),
    components: {
      Form,
    },
    methods: {
        removeInstance(item) {
            axios.delete(`/api/instances/${item.name}`)
            .then(response => {
                console.log(response);
                const index = this.instances.indexOf(item);
                this.instances.splice(index, 1);
            }).catch(error => {
                console.log(error);
            });
        },
        /*
        runLoadtest(item) {
            axios.get("/api/loadtest", {
                name: item.name,
                namespace: item.namespace,
            }).then(response => {
                console.log(response);
            }).catch(error => {
                console.log(error);
            });
        },
        */
        // get Config List from server
        loadData() {
            this.instances = [];
            axios.get('/api/instances/list')
                .then(response => {
                    for (const instancename in response.data.instances) {
                        let instance = response.data.instances[instancename];
                        this.instances.push({
                            name: instance.name,
                            namespace: instance.namespace,
                            ingressHost: "http://"+instance.ingressHost,
                            creationTimestamp: instance.creationTimestamp,
                            numUsers: instance.numUsers,
                            spawnRate: instance.spawnRate,
                            worker: instance.worker,
                        });
                    }
                   console.log(this.instances);
                }
            )
            .catch((err) => {
                console.error(err);
            });

        },
    },
}
</script>

<style lang="scss">
</style>