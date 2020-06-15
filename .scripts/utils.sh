RED='\033[0;31m'
GRN='\033[0;32m'
BLU='\033[0;34m'
BRED='\033[1;31m'
BGRN='\033[1;32m'
BBLU='\033[1;34m'
RST='\033[0m'

_red() {
    if (( $# > 1 )) && [[ "$1" == "bold" ]]; then
        shift
        echo -e "${BRED}$@${RST}"
    else
        echo -e "${RED}$1${RST}"
    fi
}

_green() {
    if (( $# > 1 )) && [[ "$1" == "bold" ]]; then
        shift
        echo -e "${BGRN}$@${RST}"
    else
        echo -e "${GRN}$1${RST}"
    fi
}

_blue() {
    if (( $# > 1 )) && [[ "$1" == "bold" ]]; then
        shift
        echo -e "${BBLU}$@${RST}"
    else
        echo -e "${BLU}$1${RST}"
    fi
}

_log() {
    color="$1"
    shift
    case "$color" in
        "red")
            _red "$@"
            ;;
        "green")
            _green "$@"
            ;;
        "blue")
            _blue "$@"
            ;;
        *)
            echo "Error logging: unknown color"
            exit 1
            ;;
    esac
}
