#!/bin/bash
dtslint --expectOnly --localTs node_modules/typescript/lib types
npm run lint
