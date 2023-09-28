import { Component } from 'react';

import './charList.scss';

import MarvelService from '../../services/MarvelService';

import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
class CharList extends Component {

    state = {
        chars: [],
        loading: true,
        error: false
    }

    marvelService = new MarvelService();

    componentDidMount() {
        // this.foo.bar = 0; // to crash Component
        this.updateChars();
    }

    onCharsLoaded = (chars) => {
        this.setState({
            chars,
            loading: false
        });
    }

    onError = () => {
        this.setState({
            loading: false,
            error: true
        });
    }

    updateChars = () => {
        this.marvelService
            .getAllCharacters()
            .then(this.onCharsLoaded)
            .catch(this.onError)
    }

    render() {

        const {chars, loading, error} = this.state;
        const errorMessage = error ? <ErrorMessage /> : null;
        const spinner = loading ? <Spinner /> : null;
        const content = !(loading || error) ?  <View chars={chars} onCharSelected={this.props.onCharSelected}/> : null;

        return (
            <div className="char__list">
                {errorMessage}
                {spinner}
                {content}
                <button className="button button__main button__long">
                    <div className="inner">load more</div>
                </button>
            </div>
        )
    }
}

const View = ({chars, onCharSelected}) => {

    const content = chars.map(({thumbnail, name, id}) => {
        const imgStyle = thumbnail === MarvelService.NOT_FOUND_IMG? {objectFit: "unset"} : {};
        return (
            <li className="char__item" key={id} onClick={() => onCharSelected(id)}>
                <img src={thumbnail} alt={name} style={imgStyle}/>
                <div className="char__name">{name}</div>
            </li>
        )
    })

    return (
        <ul className="char__grid">
            {content}
        </ul>
    );
}

export default CharList;