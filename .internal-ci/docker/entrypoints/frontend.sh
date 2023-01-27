#!/bin/bash

case "${MC_NETWORK}" in
    main|test)
        exec nginx -c "/etc/nginx/${MC_NETWORK}.nginx.conf" -g "daemon off;"
    ;;
    *)
        exec "$@"
    ;;
esac

