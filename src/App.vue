<script setup>
import FixedHeight from './components/FixedHeight.vue'
import VirtualList from '@/components/VirtualList.vue'
import Mock from 'mockjs'
let data = []
for (let i = 0; i < 1000; i++) {
    data.push({ id: i, value: i })
}
let { dataList } = Mock.mock({
    'dataList|500': [
        {
            'id|+1': 1,
            title: '@ctitle',
            description: '@cparagraph(2,15)'
        }
    ]
})
</script>
<template>
    <!-- 固定高度的虚拟列表 -->
    <!-- <FixedHeight :listData="data" :itemSize="100"> </FixedHeight> -->

    <!-- 高度不固定的虚拟列表 -->
    <VirtualList style="height: 100%; width: 80%" :listData="dataList">
        <template v-slot="{ record }">
            <div class="row_content" @click="handleClick(record)">
                <p>{{ record.id }} : {{ record.title }}</p>
                <article>{{ record.description }}</article>
            </div>
        </template>
    </VirtualList>
</template> 
<style >
body {
    height: 100%;
    padding: 0px;
    margin: 0px;
}

html {
    height: 100%;
    padding: 0px;
    margin: 0px;
}

#app {
    height: 100%;
}
.row_content {
    padding: 30px;
    border-bottom: 2px solid rgb(251, 152, 152);
}
</style>