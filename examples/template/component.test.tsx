import React from 'react'
import { mount } from 'enzyme'
import type { ReactWrapper } from 'enzyme'
import { act } from 'react-dom/test-utils'

const Component: React.FC = () => {
  return <h1>hello world</h1>
}

describe('react component', () => {
  let wrapper: ReactWrapper

  test('render text', async () => {
    await act(async () => {
      wrapper = mount(<Component />)
    })
    wrapper.update()

    expect(wrapper.text()).toEqual('hello world')
  })
})
