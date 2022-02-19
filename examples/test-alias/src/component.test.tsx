import React from 'react'
import { mount } from 'enzyme'
import type { ReactWrapper } from 'enzyme'
import { act } from 'react-dom/test-utils'
import Component from '@/component'

describe('react component', () => {
  let wrapper: ReactWrapper<any>

  test('allows us to set props', async () => {
    await act(async () => {
      wrapper = mount(<Component bar='baz' />)
    })
    wrapper.update()

    expect(wrapper.props().bar).toEqual('baz')

    await act(async () => {
      wrapper.setProps({ bar: 'foo' })
    })

    expect(wrapper.props().bar).toEqual('foo')
    expect(wrapper.text()).toEqual('foo')
  })
})
