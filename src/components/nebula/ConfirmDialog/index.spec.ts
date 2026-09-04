import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from './index.vue'

describe('ConfirmDialog', () => {
  it('visible=false 时不渲染弹窗', () => {
    const wrapper = mount(ConfirmDialog, { props: { visible: false } })
    expect(wrapper.find('.nc-mask').exists()).toBe(false)
  })

  it('visible=true 渲染标题与默认文案', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { visible: true, title: '删除商品？' },
    })
    expect(wrapper.text()).toContain('删除商品？')
    expect(wrapper.text()).toContain('确定执行该操作吗？')
  })

  it('点击主按钮 emit confirm', async () => {
    const wrapper = mount(ConfirmDialog, { props: { visible: true } })
    await wrapper.find('.nc-btn.primary').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('点击取消 emit cancel 并同步 update:visible=false', async () => {
    const wrapper = mount(ConfirmDialog, { props: { visible: true } })
    await wrapper.find('.nc-btn.ghost').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
  })

  it('点击遮罩层取消（.self 修饰符）', async () => {
    const wrapper = mount(ConfirmDialog, { props: { visible: true } })
    await wrapper.find('.nc-mask').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('danger 属性给主按钮加 danger 样式类', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { visible: true, danger: true },
    })
    expect(wrapper.find('.nc-btn.primary').classes()).toContain('danger')
  })

  it('slot 插槽内容优先于 message 文本', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { visible: true, message: '默认提示' },
      slots: { default: '<div class="custom-slot">自定义内容</div>' },
    })
    expect(wrapper.find('.custom-slot').exists()).toBe(true)
    expect(wrapper.text()).toContain('自定义内容')
  })
})
