<template>
    <v-container :fluid="true">

        <v-layout row wrap>
            <v-flex xs12 md12>
                <v-data-table
                    :headers="headers"
                    :items="locustfiles"
                    :items-per-page="15"
                    class="elevation-0"
                >
                <template v-slot:item="row">
                    <tr>
                        <td>{{row.item.name}}</td>
                        <td>{{row.item.namespace}}</td>
                        <td>{{row.item.creationTimestamp}}</td>
                        <td>
                            <v-btn
                                color="red darken-4"
                                class="mx-2"
                                fab dark x-small
                                elevation="2"
                                 @click="removeConfig(row.item)"
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
                            -->
                        </td>
                    </tr>
                </template>
                </v-data-table>
            </v-flex>
        </v-layout>
        
        <Form></Form>


    </v-container>
</template>

<script>
import axios from "axios";
import Form from "./config_form.vue";
export default {
    sockets: {
        updatedLocustfiles(locustfiles) {
            let locustfilesList = [];
            for (let locustfile in locustfiles) {
                locustfilesList.push(locustfiles[locustfile]);
            }
            this.locustfiles = locustfilesList;
        },
    },
    mounted() {
        this.getConfigList();
    },
    data: () => ({
      headers: [
        {
            text: 'Name',
            align: 'start',
            value: 'name',
        },
        { text: 'Namespace', value: 'namespace' },
        { text: 'Creation Timestamp', value: 'creationTimestamp' },
        {   
            text: '', 
            value: 'toolbox',
            align: 'end',
            sortable: false,
        },
      ],
      locustfiles: [],
    }),
    components: {
      Form,
    },
    methods: {
        removeConfig(item) {
            axios.delete(`/api/locustfile/${item.name}`)
            .then(response => {
                console.log(response);
                const index = this.locustfiles.indexOf(item);
                this.locustfiles.splice(index, 1);
            }).catch(error => {
                console.log(error);
            });
        },

        // get Config List from server
        getConfigList() {
            this.locustfiles = [];
            axios.get('/api/locustfile')
                .then(response => {
                    let configslist = response.data.locustfiles.response.body.items;
                    configslist.forEach(element => {
                        console.log(element.metadata.name);
                        this.locustfiles.push({
                            name: element.metadata.name,
                            namespace: element.metadata.namespace,
                            creationTimestamp: element.metadata.creationTimestamp
                        });
                    });
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