import { SignIn } from '@clerk/clerk-react'

function Login() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='flex flex-col items-center gap-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>ReproPulse</h1>
          <p className='text-gray-500 mt-1'>Sign in to your account</p>
        </div>
        <SignIn
          afterSignInUrl='/dashboard'
        />
      </div>
    </div>
  )
}

export default Login