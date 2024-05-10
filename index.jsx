// Constantes
const version = "1.2.2";
const months = ["jan2023", "jan2024"];

// Componentes
function Homepage() {
    return (
        <div id="container">
            <Header title="Salário dos Militares do DF" />
            <Parametros />
            <Calculo />
            <Rodape version={version} />
        </div>
    );
}

function Header(props) {
    return <h1>{props.title}</h1>;
}

function Parametros() {
    const [likes, setLikes] = React.useState(0);
    function handleClick() {
        setLikes(likes + 1);
    }
    return (
        <div>
            <h1>Parâmetros de Cálculo</h1>
            <button onClick={handleClick}>Like ({likes})</button>
        </div>);
}

function Calculo() {
    return (
        <div>
            <h1>Cálculo</h1>
            <h2>{monthsToCalc(months)}</h2>
        </div>
    );
}

function Rodape(props) {
    return <h1>{`Versão ${props.version}`}</h1>;
}

function monthsToCalc(months) {
    return (
        <ul>
            {months.map((name) => (
                <li key={name}>{name}</li>
            ))}
        </ul>
    );
}

// Renderização
const domNode = document.getElementById('app');
const root = ReactDOM.createRoot(domNode);
root.render(<Homepage />);