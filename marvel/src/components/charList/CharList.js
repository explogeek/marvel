import { Component } from 'react';
import PropTypes from 'prop-types';

import './charList.scss';

import MarvelService from '../../services/MarvelService';

import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
class CharList extends Component {

    state = {
        chars: [],
        loading: true,
        error: false,
        newItemLoading: false,
        charEnded: false,
        offset: MarvelService._BASE_OFFSET
    }

    marvelService = new MarvelService();
    itemRefs = [];

    setRef = (ref) => {
        this.itemRefs.push(ref);
    }

    focusOnItem = (id) => {
        // Я реализовал вариант чуть сложнее, и с классом и с фокусом
        // Но в теории можно оставить только фокус, и его в стилях использовать вместо класса
        // На самом деле, решение с css-классом можно сделать, вынеся персонажа
        // в отдельный компонент. Но кода будет больше, появится новое состояние
        // и не факт, что мы выиграем по оптимизации за счет бОльшего кол-ва элементов

        // По возможности, не злоупотребляйте рефами, только в крайних случаях
        this.itemRefs.forEach(item => item.classList.remove('char__item_selected'));
        this.itemRefs[id].classList.add('char__item_selected');
        this.itemRefs[id].focus();
    }

    componentDidMount() {
        // this.foo.bar = 0; // to crash Component
        this.onRequest();
    }

    onRequest = (offset) => {
        this.onCharListLoading();
        this.marvelService
            .getAllCharacters(offset)
            .then(this.onCharsLoaded)
            .catch(this.onError)
    }

    onCharListLoading = () => {
        this.setState({
            newItemLoading: true
        })
    }

    onCharsLoaded = (newChars) => {
        this.setState(({offset, chars}) => ({
            chars: [...chars, ...newChars],
            loading: false,
            newItemLoading: false,
            offset: offset + 9,
            charEnded: newChars.length < 9
        }));
    }

    onError = () => {
        this.setState({
            loading: false,
            error: true
        });
    }

    render() {
        const {chars, loading, error, newItemLoading, offset, charEnded} = this.state;
        const errorMessage = error ? <ErrorMessage /> : null;
        const spinner = loading ? <Spinner /> : null;
        const content = !(loading || error) ?  <View chars={chars} 
                                                     onCharSelected={this.props.onCharSelected}
                                                     setRef={this.setRef}
                                                     focusOnItem={this.focusOnItem}/> : null;

        return (
            <div className="char__list">
                {errorMessage}
                {spinner}
                {content}
                <button 
                    className="button button__main button__long"
                    disabled={newItemLoading}
                    style={{'display': charEnded ? 'none' : 'block'}}
                    onClick={() => this.onRequest(offset)}>
                    <div className="inner">load more</div>
                </button>
            </div>
        )
    }
}

CharList.propTypes = {
    onCharSelected: PropTypes.func
}

const View = ({chars, onCharSelected, focusOnItem, setRef}) => {

    const content = chars.map(({thumbnail, name, id}, i) => {
        const imgStyle = thumbnail === MarvelService.NOT_FOUND_IMG? {objectFit: "unset"} : {};
        return (
            <li className="char__item" 
                key={id}
                tabIndex={0}
                ref={setRef} 
                onClick={() => {
                    onCharSelected(id);
                    focusOnItem(i);
                }}
                onKeyPress={(e) => {
                    if (e.key === ' ' || e.key === "Enter") {
                        onCharSelected(id);
                        focusOnItem(i);
                    }
                }}>
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