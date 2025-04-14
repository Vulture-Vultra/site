import React from 'react'

import Images from './images/Images'
import Cards from './cards/Cards'
import Text from './text/Text'

function Purpose() {
  return (
    <div>
     <div className='flex flex-col md:flex-row rounded-2xl bg-gradient-to-b from-white/10 to-transparent'>
        <div className='md:w-1/2 w-full'>
            <Text />
        </div>
        <div className='md:w-1/2 w-full'>
            <Images />
        </div>
     </div>
     <div className='mt-4 w-full'>
        <Cards />
     </div>
    </div>
  )
}

export default Purpose
