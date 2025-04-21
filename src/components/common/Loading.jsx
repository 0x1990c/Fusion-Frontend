import { Spinner } from "./Spinner"

export const Loading = () => {
  return (
    <div className="flex w-[100%] h-[100vh] justify-center items-center z-50 bg-black bg-opacity-40 fixed">
        <Spinner />
    </div>
  )
}
