<template>
    <div class="virtual_scroller" :style="{height: height + 'px'}">
        <div class="content_box" :style="{'height': (allData.length*rowHeight)+'px'}">
            <div v-for="(item, index) in showList" class="row_item" :key="index" :style="{height: rowHeight + 'px'}">{{item.text}}</div>
        </div>
    </div>
</template>

<script lang="ts">
    import { defineComponent, ref, onMounted, nextTick } from 'vue'

    interface IData{
        text: string
    }

    export default defineComponent({
        name: 'App',
        props: {
            scrollHeight: {
                type: Number,
                default: 500
            },
            itemHeight: {
                type: Number,
                default: 48
            }
        },
        setup(props) {
            let lastVisibleItemIndex = 0
            let allData: IData[] = []
            for(let i = 1; i < 1000; i++) {
                allData.push({text: `I am ${i}`})
            }
            const height = props.scrollHeight as number
            const rowHeight = props.itemHeight as number
            const pageSize = Math.ceil(height / rowHeight) + 5
            let showList = ref<IData[]>(allData.slice(0, pageSize))

            onMounted(() => {
                const scroller: HTMLElement = document.querySelector('.virtual_scroller') as HTMLElement
                const handleScroll = (e: Event) => {
                    const {scrollTop} = e.target as HTMLElement
                    const firstVisibleItemIndex = Math.floor(scrollTop / rowHeight)
                    if(firstVisibleItemIndex > lastVisibleItemIndex) {
                        showList.value = allData.slice(firstVisibleItemIndex, firstVisibleItemIndex + pageSize)
                        nextTick(() => {
                            let rows: NodeList = document.querySelectorAll('.row_item')
                            rows.forEach((row: any) => row.style.transform = `translateY(${scrollTop}px)`)
                        })
                        lastVisibleItemIndex = firstVisibleItemIndex
                    } else if(firstVisibleItemIndex < lastVisibleItemIndex) {
                        // 往上滚
                        if(lastVisibleItemIndex <= 3) {
                            // 快滚动到顶点时，上面用于填充的三个不用再处理了，直接默认显示前三个就行了
                            showList.value = allData.slice(0, pageSize)
                            nextTick(() => {
                                let rows: NodeList = document.querySelectorAll('.row_item')
                                rows.forEach((row: any) => row.style.transform = `translateY(${0}px)`)
                            })
                        } else {
                            // 往上滚的时候往上填充了三个的高度，否则滚动过快的时候会看到上面是空白的
                            showList.value = allData.slice(firstVisibleItemIndex - 3, firstVisibleItemIndex + pageSize - 3)
                            // 这里使用nextTick是因为showList.value的数据的变化，DOM元素个数也变化了，必须等渲染完再给他们位移，否则没有渲染出来的dom不会产生位移量
                            nextTick(() => {
                                let rows: NodeList = document.querySelectorAll('.row_item')
                                rows.forEach((row: any) => row.style.transform = `translateY(${scrollTop - rowHeight * 3}px)`)
                            })
                        }
                    }
                    lastVisibleItemIndex = firstVisibleItemIndex
                }
                scroller.addEventListener('scroll', handleScroll)
            })
            return {
                height,
                rowHeight,
                showList,
                allData
            }
        }
    })
</script>


<style scoped lang="less">
    .virtual_scroller{
        background-color: #f0f2f7;
        width: 800px;
        margin: auto;
        overflow: auto;
    }
    .row_item:nth-of-type(2n-1){
        background-color: pink;
        transition: all .1s;
    }
    .row_item:nth-of-type(2n){
        background-color: darkcyan;
        transition: all .1s;
    }
</style>
