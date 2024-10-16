const authLayout =  ({children}: {children : React.ReactNode}) => {
return (
    <div className="h-full flex items-center justify-center mt-10">
     {children}
    </div>
)
}

export default authLayout