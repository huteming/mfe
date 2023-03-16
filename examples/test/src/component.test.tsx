import Component from './component'
import { mount } from 'enzyme'
import type { ReactWrapper } from 'enzyme'
import React from 'react'
import { act } from 'react-dom/test-utils'

describe('react component', () => {
  let wrapper: ReactWrapper<any>

  test('allows us to set props', async () => {
    await act(async () => {
      wrapper = mount(<Component bar="baz" />)
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
