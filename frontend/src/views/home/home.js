
const Home = () => {
    let user = localStorage.getItem('username');

    return (
        <div>
            <h1>Hello {user}</h1>
            <h3>Let's talk?</h3>
        </div>
    )    
}

export default Home;