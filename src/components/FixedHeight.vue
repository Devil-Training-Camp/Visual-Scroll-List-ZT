<script  setup>
import { computed, reactive, ref, onMounted } from 'vue'
const list = ref(null)
const props = defineProps({
    //所有列表数据
    listData: {
        type: Array,
        default: () => []
    },
    //每项高度
    itemSize: {
        type: Number,
        default: 200
    }
})

const state = reactive({
    //可视区域高度
    screenHeight: 0,
    //偏移量
    startOffset: 0,
    //起始索引
    start: 0,
    //结束索引
    end: null
})

//列表总高度
const listHeight = computed(() => {
    return props.listData.length * props.itemSize
})
//可显示的列表项数
const visibleCount = computed(() => {
    return Math.ceil(state.screenHeight / props.itemSize)
})
//偏移量对应的style
const getTransform = computed(() => {
    return `translate(0,${state.startOffset}px)`
})
//获取真实显示列表数据
const visibleData = computed(() => {
    return props.listData.slice(
        state.start,
        Math.min(state.end, props.listData.length)
    )
})

onMounted(() => {
    state.screenHeight = 896
    state.start = 0
    state.end = state.start + visibleCount.value
})

const scrollEvent = () => {
    //当前滚动位置
    let scrollTop = list.value.scrollTop
    //此时的开始索引
    state.start = Math.floor(scrollTop / props.itemSize)
    //此时的结束索引
    state.end = state.start + visibleCount.value
    //此时的偏移量
    state.startOffset = scrollTop - (scrollTop % props.itemSize)
}
</script>
<template>
    <div
        ref="list"
        class="infinite-list-container"
        @scroll="scrollEvent($event)"
    >
        <!-- 占位 用于显示滚动条  -->
        <div
            class="infinite-list-phantom"
            :style="{ height: listHeight + 'px' }"
        ></div>
        <!-- 列表数据  -->
        <div class="infinite-list" :style="{ transform: getTransform }">
            <div
                ref="items"
                class="infinite-list-item"
                v-for="item in visibleData"
                :key="item.id"
                :style="{
                    height: itemSize + 'px',
                    lineHeight: itemSize + 'px'
                }"
            >
                序号： {{ item.value }}
            </div>
        </div>
    </div>
</template>
<style scoped>
.infinite-list-container {
    height: 100%;
    overflow: auto;
    position: relative;
    -webkit-overflow-scrolling: touch;
}

.infinite-list-phantom {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: -1;
}

.infinite-list {
    width: 100%;
    left: 0;
    right: 0;
    top: 0;
    position: absolute;
    text-align: center;
}

.infinite-list-item {
    padding: 10px;
    color: #555;
    box-sizing: border-box;
    border-bottom: 1px solid #999;
}
</style>